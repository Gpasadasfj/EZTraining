"""
Importa el catálogo de Exercise a partir de:
  - las imágenes locales generadas a mano en media/exercises/
  - los datos (nombre, músculos, categoría, equipamiento) de la API pública de wger

La imagen nunca se descarga de wger: solo se usa como fuente de datos y se
enlaza la imagen local ya existente. El comando es idempotente (se puede
ejecutar varias veces sin duplicar registros) y soporta --dry-run.
"""
import json
import re
import unicodedata
from difflib import get_close_matches
from pathlib import Path

import requests
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from exercises.models import BodyPart, Equipment, Exercise, Muscle
from exercises.management.commands._wger_data import (
    BODY_PART_ES_BY_ID,
    EQUIPMENT_ES_BY_ID,
    LANG_EN,
    LANG_ES,
    MUSCLE_ES_BY_ID,
    WGER_API_URL,
)

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
COPY_SUFFIX_RE = re.compile(r"\s+copy(\s+\d+)?$", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")
PARAGRAPH_RE = re.compile(r"<p[^>]*>(.*?)</p>", re.IGNORECASE | re.DOTALL)
BREAK_RE = re.compile(r"<br\s*/?>", re.IGNORECASE)
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?:])\s+(?=[A-ZÁÉÍÓÚÑ0-9])")

FUZZY_MATCH_CUTOFF = 0.85
SUGGESTION_CUTOFF = 0.6

ES_OVERRIDES_PATH = Path(__file__).resolve().parent / "_es_overrides.json"
FILENAME_OVERRIDES_PATH = Path(__file__).resolve().parent / "_filename_overrides.json"


def normalize_name(name):
    name = name.replace("-", " ").replace("_", " ")
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    name = re.sub(r"[^a-z0-9\s]", " ", name.lower())
    return re.sub(r"\s+", " ", name).strip()


def html_to_steps(html):
    """
    '<p>Paso 1. Paso 2.</p><p>Paso 3.</p>' -> {"1": "Paso 1.", "2": "Paso 2.", "3": "Paso 3."}

    wger no siempre usa un <p> por paso: a veces mete varias frases en un
    mismo párrafo separadas solo por puntos. Por eso, además de partir por
    párrafo/<br>, cada párrafo se vuelve a partir por frase.
    """
    if not html:
        return {}
    paragraphs = PARAGRAPH_RE.findall(html) or [html]
    steps = {}
    step_no = 1
    for raw in paragraphs:
        raw = BREAK_RE.sub("\n", raw)
        for chunk in raw.split("\n"):
            text = TAG_RE.sub("", chunk).replace("&nbsp;", " ")
            text = re.sub(r"\s+", " ", text).strip()
            if not text:
                continue
            for sentence in SENTENCE_SPLIT_RE.split(text):
                sentence = sentence.strip()
                if sentence:
                    steps[str(step_no)] = sentence
                    step_no += 1
    return steps


class Command(BaseCommand):
    help = (
        "Crea/actualiza BodyPart, Muscle, Equipment y Exercise a partir de las "
        "imágenes locales en media/exercises/ y los datos de la API de wger."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="No modifica la base de datos, solo muestra el resultado del matching.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        images_dir = Path(settings.MEDIA_ROOT) / "exercises"

        if not images_dir.is_dir():
            self.stderr.write(self.style.ERROR(f"No existe el directorio {images_dir}"))
            return

        self.stdout.write("Descargando catálogo de wger...")
        catalog = self.fetch_wger_catalog()
        self.stdout.write(f"  {len(catalog)} ejercicios recibidos de wger.")

        name_index = self.build_name_index(catalog)
        id_index = {exercise["id"]: exercise for exercise in catalog}
        overrides = self.load_json(ES_OVERRIDES_PATH)
        filename_overrides = self.load_json(FILENAME_OVERRIDES_PATH)

        matched, duplicates, unmatched = self.match_local_images(
            images_dir, name_index, id_index, filename_overrides
        )

        caches = {"body_part": {}, "muscle": {}, "equipment": {}}
        to_import = []
        pending_es = []

        for path, exercise, approx in matched:
            defaults = self.build_exercise_defaults(exercise, overrides)
            if defaults is None:
                pending_es.append((path.name, exercise))
                continue
            to_import.append((path, exercise, approx, defaults))

        self.print_report(matched, duplicates, unmatched, pending_es)

        if dry_run:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING("Dry-run: no se ha modificado la base de datos."))
            return

        created = updated = 0
        with transaction.atomic():
            for path, exercise, approx, defaults in to_import:
                obj, was_created = self.save_exercise(path, exercise, defaults, caches)
                created += was_created
                updated += not was_created

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(f"Creados: {created}  Actualizados: {updated}  Pendientes de traducción: {len(pending_es)}")
        )

    # ------------------------------------------------------------------ #
    # wger API
    # ------------------------------------------------------------------ #
    def fetch_wger_catalog(self):
        results = []
        url = WGER_API_URL
        params = {"limit": 100}
        while url:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            results.extend(data["results"])
            url = data.get("next")
            params = None  # la URL "next" ya incluye la query string
        return results

    def build_name_index(self, catalog):
        index = {}
        for exercise in catalog:
            translation = self._translation(exercise, LANG_EN)
            if not translation or not translation.get("name"):
                continue
            key = normalize_name(translation["name"])
            index.setdefault(key, []).append(exercise)
        return index

    def _translation(self, exercise, language):
        return next((t for t in exercise["translations"] if t["language"] == language), None)

    def _en_name(self, exercise):
        translation = self._translation(exercise, LANG_EN)
        return translation["name"] if translation else "?"

    # ------------------------------------------------------------------ #
    # Traducciones ES manuales (fallback cuando wger no las tiene)
    # ------------------------------------------------------------------ #
    def load_json(self, path):
        if not path.exists():
            return {}
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    # ------------------------------------------------------------------ #
    # Matching de imágenes locales <-> catálogo de wger
    # ------------------------------------------------------------------ #
    def match_local_images(self, images_dir, name_index, id_index, filename_overrides):
        matched = []
        duplicates = []
        unmatched = []
        seen_keys = {}
        all_keys = list(name_index.keys())

        for path in sorted(images_dir.iterdir()):
            if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue

            stem = COPY_SUFFIX_RE.sub("", path.stem)
            key = normalize_name(stem)

            if key in seen_keys:
                duplicates.append((path.name, seen_keys[key]))
                continue

            override_id = filename_overrides.get(path.name)
            if override_id is not None:
                exercise = id_index.get(override_id)
                if exercise is None:
                    unmatched.append((path.name, "override apunta a un id inexistente", []))
                    continue
                seen_keys[key] = path.name
                matched.append((path, exercise, "override"))
                continue

            candidates = name_index.get(key)
            approx = False
            if not candidates:
                close = get_close_matches(key, all_keys, n=1, cutoff=FUZZY_MATCH_CUTOFF)
                if close:
                    candidates = name_index[close[0]]
                    approx = True

            if candidates and len(candidates) == 1:
                seen_keys[key] = path.name
                matched.append((path, candidates[0], approx))
            elif candidates:
                labels = [f"wger#{c['id']} \"{self._en_name(c)}\"" for c in candidates]
                unmatched.append((path.name, "ambiguo", labels))
            else:
                close = get_close_matches(key, all_keys, n=3, cutoff=SUGGESTION_CUTOFF)
                labels = [self._en_name(name_index[ck][0]) for ck in close]
                unmatched.append((path.name, "sin coincidencia", labels))

        return matched, duplicates, unmatched

    # ------------------------------------------------------------------ #
    # Construcción de datos para Exercise
    # ------------------------------------------------------------------ #
    def build_exercise_defaults(self, exercise, overrides):
        en = self._translation(exercise, LANG_EN)
        es = self._translation(exercise, LANG_ES)
        override = overrides.get(str(exercise["id"]))

        name_en = en["name"]
        instructions_en = html_to_steps(en.get("description", ""))

        name_es = es["name"] if es and es.get("name") else None
        instructions_es = html_to_steps(es["description"]) if es and es.get("description") else {}

        if not name_es and override:
            name_es = override.get("name_es")
        if not instructions_es and override:
            instructions_es = override.get("instructions_es", {})

        if not name_es or not instructions_es or not instructions_en:
            return None

        if not exercise["muscles"]:
            return None

        return {
            "name_en": name_en,
            "name_es": name_es,
            "instructions_en": instructions_en,
            "instructions_es": instructions_es,
        }

    def get_body_part(self, category, cache):
        cat_id = category["id"]
        if cat_id in cache:
            return cache[cat_id]
        name_en = category["name"]
        name_es = BODY_PART_ES_BY_ID.get(cat_id, name_en)
        obj, _ = BodyPart.objects.update_or_create(
            slug=slugify(name_en),
            defaults={"name_en": name_en, "name_es": name_es},
        )
        cache[cat_id] = obj
        return obj

    def get_muscle(self, muscle_data, cache):
        muscle_id = muscle_data["id"]
        if muscle_id in cache:
            return cache[muscle_id]
        name_en = muscle_data.get("name_en") or muscle_data["name"]
        name_es = MUSCLE_ES_BY_ID.get(muscle_id, name_en)
        obj, _ = Muscle.objects.update_or_create(
            slug=slugify(name_en),
            defaults={"name_en": name_en, "name_es": name_es},
        )
        cache[muscle_id] = obj
        return obj

    def get_equipment(self, equipment_data, cache):
        equipment_id = equipment_data["id"]
        if equipment_id in cache:
            return cache[equipment_id]
        name_en = equipment_data["name"]
        name_es = EQUIPMENT_ES_BY_ID.get(equipment_id, name_en)
        obj, _ = Equipment.objects.update_or_create(
            slug=slugify(name_en),
            defaults={"name_en": name_en, "name_es": name_es},
        )
        cache[equipment_id] = obj
        return obj

    def unique_slug(self, base_slug, source_id):
        conflict = Exercise.objects.filter(slug=base_slug).exclude(source_id=source_id).exists()
        return f"{base_slug}-{source_id}" if conflict else base_slug

    def save_exercise(self, path, exercise, defaults, caches):
        body_part = self.get_body_part(exercise["category"], caches["body_part"])
        primary_muscle = self.get_muscle(exercise["muscles"][0], caches["muscle"])

        secondary_data = exercise["muscles"][1:] + exercise["muscles_secondary"]
        secondary_muscles = {
            m.pk: m
            for m in (self.get_muscle(m_data, caches["muscle"]) for m_data in secondary_data)
            if m.pk != primary_muscle.pk
        }

        equipment_objs = [
            self.get_equipment(e_data, caches["equipment"]) for e_data in exercise["equipment"]
        ]

        slug = self.unique_slug(slugify(defaults["name_en"]), exercise["id"])

        obj, created = Exercise.objects.update_or_create(
            source_id=exercise["id"],
            defaults={
                **defaults,
                "slug": slug,
                "body_part": body_part,
                "muscle": primary_muscle,
                "image": f"exercises/{path.name}",
            },
        )
        obj.secondary_muscles.set(secondary_muscles.values())
        obj.equipment.set(equipment_objs)
        return obj, created

    # ------------------------------------------------------------------ #
    # Reporte
    # ------------------------------------------------------------------ #
    def print_report(self, matched, duplicates, unmatched, pending_es):
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"COINCIDENCIAS ({len(matched)})"))
        marks = {True: "~ aproximado", False: "exacto", "override": "override manual verificado"}
        for path, exercise, approx in matched:
            self.stdout.write(f"  {path.name:45s} -> wger#{exercise['id']} \"{self._en_name(exercise)}\" ({marks[approx]})")

        if duplicates:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING(f"DUPLICADOS LOCALES IGNORADOS ({len(duplicates)})"))
            for name, original in duplicates:
                self.stdout.write(f"  {name:45s} -> mismo que {original}")

        if unmatched:
            self.stdout.write("")
            self.stdout.write(self.style.ERROR(f"SIN COINCIDENCIA ({len(unmatched)})"))
            for name, reason, suggestions in unmatched:
                suffix = f" (candidatos: {', '.join(suggestions)})" if suggestions else ""
                self.stdout.write(f"  {name:45s} [{reason}]{suffix}")

        if pending_es:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING(f"PENDIENTES DE TRADUCCION ES ({len(pending_es)})"))
            for name, exercise in pending_es:
                self.stdout.write(f"  {name:45s} -> wger#{exercise['id']} \"{self._en_name(exercise)}\" (sin override en _es_overrides.json)")
