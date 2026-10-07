from types import SimpleNamespace

from django.contrib.auth import get_user_model
from django.test import TestCase

from exercises.models import Exercise, Muscle
from routines.serializers import RoutineExerciseSerializer

User = get_user_model()


def make_user(username):
    return User.objects.create_user(
        username=username,
        email=f"{username}@test.com",
        password="pass1234",
    )


class RoutineExerciseSerializerTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoral", slug="pectoral")
        cls.ana = make_user("ana")
        cls.luis = make_user("luis")

        cls.catalog = Exercise.objects.create(name_es="Press banca", slug="press-banca", muscle=cls.muscle)
        cls.ana_exercise = Exercise.objects.create(
            name_es="Hip thrust con banda", slug="hip-thrust-ana", muscle=cls.muscle, owner=cls.ana,
        )
        cls.luis_exercise = Exercise.objects.create(
            name_es="Remo en máquina", slug="remo-luis", muscle=cls.muscle, owner=cls.luis,
        )

    def make_serializer(self, exercise, user=None, **overrides):
        data = {
            "exercise": exercise.id,
            "order": 1,
            "target_sets": 3,
            "min_reps": 8,
            "max_reps": 12,
            "target_rir": 2,
            "rest_time": 90,
            **overrides,
        }
        request = SimpleNamespace(user=user or self.ana)
        return RoutineExerciseSerializer(data=data, context={"request": request})

    def test_can_use_catalog_exercise(self):
        serializer = self.make_serializer(self.catalog)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_can_use_own_exercise(self):
        serializer = self.make_serializer(self.ana_exercise)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_cannot_use_other_users_exercise(self):
        serializer = self.make_serializer(self.luis_exercise)

        self.assertFalse(serializer.is_valid())
        self.assertIn("exercise", serializer.errors)

    def test_min_reps_greater_than_max_reps_fails(self):
        serializer = self.make_serializer(self.catalog, min_reps=12, max_reps=8)

        self.assertFalse(serializer.is_valid())
        self.assertIn("max_reps", serializer.errors)

    def test_min_reps_equal_to_max_reps_is_valid(self):
        serializer = self.make_serializer(self.catalog, min_reps=10, max_reps=10)
        self.assertTrue(serializer.is_valid(), serializer.errors)