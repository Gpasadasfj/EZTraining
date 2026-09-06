from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from exercises.models import BodyPart, Muscle, Equipment, Exercise

User = get_user_model()


class ExerciseFilterTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

        self.chest = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        self.pectoral = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")
        self.triceps = Muscle.objects.create(name_es="Tríceps", name_en="Triceps", slug="triceps")
        self.shoulders = Muscle.objects.create(name_es="Hombros", name_en="Shoulders", slug="shoulders")

        self.barbell = Equipment.objects.create(name_es="Barra", name_en="Barbell", slug="barbell")
        self.bench = Equipment.objects.create(name_es="Banco", name_en="Bench", slug="bench")

        self.press_banca = Exercise.objects.create(
            slug="press-banca", name_es="Press banca", name_en="Bench press",
            instructions_es=["Paso 1"], instructions_en=["Step 1"],
            body_part=self.chest, muscle=self.pectoral,
        )
        self.press_banca.equipment.set([self.barbell, self.bench])
        self.press_banca.secondary_muscles.set([self.triceps, self.shoulders])

        self.flexiones = Exercise.objects.create(
            slug="flexiones", name_es="Flexiones", name_en="Push-ups",
            instructions_es=["Paso 1"], instructions_en=["Step 1"],
            body_part=self.chest, muscle=self.pectoral,
        )
        self.flexiones.secondary_muscles.set([self.triceps])

    def test_filter_by_single_equipment(self):
        url = reverse("exercises-list")

        response = self.client.get(url, {"equipment": self.barbell.id})

        slugs = [e["slug"] for e in response.data["results"]]
        self.assertIn("press-banca", slugs)
        self.assertNotIn("flexiones", slugs)

    def test_filter_by_multiple_equipment_requires_all_of_them(self):
        url = reverse("exercises-list")

        response = self.client.get(url, {"equipment": [self.barbell.id, self.bench.id]})

        slugs = [e["slug"] for e in response.data["results"]]
        self.assertIn("press-banca", slugs)

    def test_filter_by_multiple_equipment_excludes_exercises_missing_one(self):
        extra_equipment = Equipment.objects.create(name_es="Mancuerna", name_en="Dumbbell", slug="dumbbell")
        url = reverse("exercises-list")

        response = self.client.get(url, {"equipment": [self.barbell.id, extra_equipment.id]})

        slugs = [e["slug"] for e in response.data["results"]]
        self.assertNotIn("press-banca", slugs)

    def test_filter_by_multiple_secondary_muscles_requires_all_of_them(self):
        url = reverse("exercises-list")

        response = self.client.get(url, {"secondary_muscles": [self.triceps.id, self.shoulders.id]})

        slugs = [e["slug"] for e in response.data["results"]]
        self.assertIn("press-banca", slugs)
        self.assertNotIn("flexiones", slugs)

    def test_filter_by_body_part(self):
        legs = BodyPart.objects.create(name_es="Pierna", name_en="Legs", slug="legs")
        Exercise.objects.create(
            slug="sentadilla", name_es="Sentadilla", name_en="Squat",
            instructions_es=["Paso 1"], instructions_en=["Step 1"],
            body_part=legs, muscle=self.pectoral,
        )
        url = reverse("exercises-list")

        response = self.client.get(url, {"body_part": self.chest.id})

        slugs = [e["slug"] for e in response.data["results"]]
        self.assertIn("press-banca", slugs)
        self.assertIn("flexiones", slugs)
        self.assertNotIn("sentadilla", slugs)


class ExercisePaginationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

        body_part = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")

        for i in range(15):
            Exercise.objects.create(
                slug=f"exercise-{i}", name_es=f"Ejercicio {i}", name_en=f"Exercise {i}",
                instructions_es=["Paso 1"], instructions_en=["Step 1"],
                body_part=body_part, muscle=muscle,
            )

    def test_list_is_paginated_to_page_size(self):
        url = reverse("exercises-list")

        response = self.client.get(url)

        self.assertEqual(len(response.data["results"]), 10)
        self.assertIsNotNone(response.data["next"])