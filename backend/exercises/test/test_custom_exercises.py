from types import SimpleNamespace

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from rest_framework.test import APIClient

from exercises.models import BodyPart, Exercise, Muscle
from exercises.permissions import IsOwnerOrReadOnly
from routines.models import Routine, RoutineDay, RoutineExercise
from workouts.models import Workout, WorkoutExercise

User = get_user_model()

# Ajusta esta ruta si en tu urls.py es distinta
EXERCISES_URL = "/api/exercises/"


def detail_url(exercise):
    return f"{EXERCISES_URL}{exercise.slug}/"


def make_user(username):
    return User.objects.create_user(
        username=username,
        email=f"{username}@test.com",
        password="pass1234",
    )


def result_items(response):
    """Elementos de un listado, esté paginado o no."""
    data = response.data
    return data["results"] if isinstance(data, dict) and "results" in data else data


def result_ids(response):
    return {item["id"] for item in result_items(response)}


class CustomExerciseBaseTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.body_part = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        cls.muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoral", slug="pectoral")

        cls.ana = make_user("ana")
        cls.luis = make_user("luis")

        cls.catalog = cls.make_exercise("Press banca", slug="press-banca", body_part=cls.body_part)
        cls.ana_exercise = cls.make_exercise("Hip thrust con banda", slug="hip-thrust-ana", owner=cls.ana)
        cls.luis_exercise = cls.make_exercise("Remo en máquina", slug="remo-luis", owner=cls.luis)

    @classmethod
    def make_exercise(cls, name, slug, owner=None, body_part=None):
        return Exercise.objects.create(
            name_es=name,
            slug=slug,
            owner=owner,
            muscle=cls.muscle,
            body_part=body_part,
        )

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.ana)


class ExerciseVisibilityTest(CustomExerciseBaseTest):
    def test_visible_to_includes_catalog_and_own_exercises(self):
        visible = set(Exercise.objects.visible_to(self.ana))
        self.assertEqual(visible, {self.catalog, self.ana_exercise})

    def test_visible_to_anonymous_user_only_includes_catalog(self):
        visible = set(Exercise.objects.visible_to(AnonymousUser()))
        self.assertEqual(visible, {self.catalog})

    def test_list_excludes_other_users_exercises(self):
        response = self.client.get(EXERCISES_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(result_ids(response), {self.catalog.id, self.ana_exercise.id})

    def test_list_filter_custom_true_returns_only_own(self):
        response = self.client.get(EXERCISES_URL, {"custom": "true"})
        self.assertEqual(result_ids(response), {self.ana_exercise.id})

    def test_list_filter_custom_false_returns_only_catalog(self):
        response = self.client.get(EXERCISES_URL, {"custom": "false"})
        self.assertEqual(result_ids(response), {self.catalog.id})

    def test_list_marks_custom_exercises(self):
        response = self.client.get(EXERCISES_URL)
        flags = {item["id"]: item["is_custom"] for item in result_items(response)}

        self.assertFalse(flags[self.catalog.id])
        self.assertTrue(flags[self.ana_exercise.id])

    def test_retrieve_own_exercise(self):
        response = self.client.get(detail_url(self.ana_exercise))
        self.assertEqual(response.status_code, 200)

    def test_retrieve_catalog_exercise(self):
        response = self.client.get(detail_url(self.catalog))
        self.assertEqual(response.status_code, 200)

    def test_retrieve_other_users_exercise_returns_404(self):
        response = self.client.get(detail_url(self.luis_exercise))
        self.assertEqual(response.status_code, 404)

    def test_anonymous_user_cannot_list(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(EXERCISES_URL)
        self.assertIn(response.status_code, (401, 403))


class ExerciseCreateTest(CustomExerciseBaseTest):
    def test_create_assigns_request_user_as_owner(self):
        response = self.client.post(
            EXERCISES_URL,
            {"name": "Press Pallof", "muscle": self.muscle.id},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        exercise = Exercise.objects.get(id=response.data["id"])
        self.assertEqual(exercise.owner, self.ana)
        self.assertEqual(exercise.name_es, "Press Pallof")
        self.assertEqual(exercise.name_en, "")
        self.assertTrue(response.data["is_custom"])

    def test_create_ignores_owner_sent_by_client(self):
        response = self.client.post(
            EXERCISES_URL,
            {"name": "Press Pallof", "muscle": self.muscle.id, "owner": self.luis.id},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        exercise = Exercise.objects.get(id=response.data["id"])
        self.assertEqual(exercise.owner, self.ana)

    def test_create_generates_unique_slug(self):
        first = self.client.post(EXERCISES_URL, {"name": "Curl araña", "muscle": self.muscle.id}, format="json")
        self.client.force_authenticate(user=self.luis)
        second = self.client.post(EXERCISES_URL, {"name": "Curl araña", "muscle": self.muscle.id}, format="json")

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 201)
        self.assertNotEqual(first.data["slug"], second.data["slug"])
        self.assertTrue(first.data["slug"].startswith("curl-arana"))

    def test_create_without_muscle_fails(self):
        response = self.client.post(EXERCISES_URL, {"name": "Press Pallof"}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("muscle", response.data)

    def test_create_with_blank_name_fails(self):
        response = self.client.post(EXERCISES_URL, {"name": "   ", "muscle": self.muscle.id}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.data)

    def test_create_duplicate_name_for_same_user_fails(self):
        response = self.client.post(
            EXERCISES_URL,
            {"name": "hip THRUST con banda", "muscle": self.muscle.id},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.data)

    def test_create_same_name_as_other_users_exercise_is_allowed(self):
        response = self.client.post(
            EXERCISES_URL,
            {"name": "Remo en máquina", "muscle": self.muscle.id},
            format="json",
        )
        self.assertEqual(response.status_code, 201)


class ExerciseUpdateTest(CustomExerciseBaseTest):
    def test_update_own_exercise(self):
        response = self.client.patch(detail_url(self.ana_exercise), {"name": "Hip thrust"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.ana_exercise.refresh_from_db()
        self.assertEqual(self.ana_exercise.name_es, "Hip thrust")

    def test_update_keeps_slug(self):
        old_slug = self.ana_exercise.slug
        self.client.patch(detail_url(self.ana_exercise), {"name": "Hip thrust"}, format="json")

        self.ana_exercise.refresh_from_db()
        self.assertEqual(self.ana_exercise.slug, old_slug)

    def test_update_catalog_exercise_is_forbidden(self):
        response = self.client.patch(detail_url(self.catalog), {"name": "Hackeado"}, format="json")

        self.assertEqual(response.status_code, 403)
        self.catalog.refresh_from_db()
        self.assertEqual(self.catalog.name_es, "Press banca")

    def test_update_other_users_exercise_returns_404(self):
        response = self.client.patch(detail_url(self.luis_exercise), {"name": "Hackeado"}, format="json")
        self.assertEqual(response.status_code, 404)


class ExerciseDeleteTest(CustomExerciseBaseTest):
    def setUp(self):
        super().setUp()
        self.routine = Routine.objects.create(user=self.ana, name="Push Pull Legs", description="")
        self.day = RoutineDay.objects.create(routine=self.routine, name="Pierna", order=1)

    def test_delete_unused_own_exercise(self):
        response = self.client.delete(detail_url(self.ana_exercise))

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Exercise.objects.filter(id=self.ana_exercise.id).exists())

    def test_delete_exercise_used_in_routine_returns_409(self):
        RoutineExercise.objects.create(
            routine_day=self.day, exercise=self.ana_exercise, order=1,
            target_sets=3, min_reps=8, max_reps=12, target_rir=2, rest_time=90,
        )

        response = self.client.delete(detail_url(self.ana_exercise))

        self.assertEqual(response.status_code, 409)
        self.assertTrue(Exercise.objects.filter(id=self.ana_exercise.id).exists())

    def test_delete_exercise_used_in_workout_returns_409(self):
        workout = Workout.objects.create(user=self.ana, routine_day=self.day)
        WorkoutExercise.objects.create(
            workout=workout, exercise=self.ana_exercise, order=1,
            target_sets=3, min_reps=8, max_reps=12, target_rir=2, rest_time=90,
        )

        response = self.client.delete(detail_url(self.ana_exercise))

        self.assertEqual(response.status_code, 409)
        self.assertTrue(WorkoutExercise.objects.filter(exercise=self.ana_exercise).exists())

    def test_delete_catalog_exercise_is_forbidden(self):
        response = self.client.delete(detail_url(self.catalog))

        self.assertEqual(response.status_code, 403)
        self.assertTrue(Exercise.objects.filter(id=self.catalog.id).exists())

    def test_delete_other_users_exercise_returns_404(self):
        response = self.client.delete(detail_url(self.luis_exercise))

        self.assertEqual(response.status_code, 404)
        self.assertTrue(Exercise.objects.filter(id=self.luis_exercise.id).exists())


class IsOwnerOrReadOnlyTest(CustomExerciseBaseTest):
    """La permission por sí sola, sin depender del queryset de la vista."""

    def check(self, method, user, exercise):
        request = SimpleNamespace(method=method, user=user)
        return IsOwnerOrReadOnly().has_object_permission(request, None, exercise)

    def test_anyone_can_read_catalog(self):
        self.assertTrue(self.check("GET", self.ana, self.catalog))

    def test_owner_can_read_and_write_own(self):
        self.assertTrue(self.check("GET", self.ana, self.ana_exercise))
        self.assertTrue(self.check("PATCH", self.ana, self.ana_exercise))
        self.assertTrue(self.check("DELETE", self.ana, self.ana_exercise))

    def test_cannot_read_other_users_exercise(self):
        self.assertFalse(self.check("GET", self.ana, self.luis_exercise))

    def test_cannot_write_catalog_or_other_users_exercise(self):
        self.assertFalse(self.check("PATCH", self.ana, self.catalog))
        self.assertFalse(self.check("DELETE", self.ana, self.luis_exercise))