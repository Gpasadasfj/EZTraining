from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse

from exercises.models import BodyPart, Exercise, Muscle
from routines.models import Routine, RoutineDay

User = get_user_model()


class RoutineDayOrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="user2", email="user2@test.com", password="testpass123"
        )
        self.routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        self.other_routine = Routine.objects.create(user=self.other_user, name="Otra rutina", description="")

    def test_first_day_gets_order_one(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("routine_day-list", kwargs={"routine_pk": self.routine.pk})

        response = self.client.post(url, {"name": "Push"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["order"], 1)

    def test_second_day_continues_the_sequence(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("routine_day-list", kwargs={"routine_pk": self.routine.pk})

        self.client.post(url, {"name": "Push"})
        response = self.client.post(url, {"name": "Pull"})

        self.assertEqual(response.data["order"], 2)

    def test_client_supplied_order_is_ignored_on_create(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("routine_day-list", kwargs={"routine_pk": self.routine.pk})

        response = self.client.post(url, {"name": "Push", "order": 99})

        self.assertEqual(response.data["order"], 1)

    def test_cannot_create_a_day_under_another_users_routine(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("routine_day-list", kwargs={"routine_pk": self.other_routine.pk})

        response = self.client.post(url, {"name": "Push"})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class RoutineExerciseOrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="user2", email="user2@test.com", password="testpass123"
        )

        body_part = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")
        self.exercise_a = Exercise.objects.create(
            slug="press-banca", name_es="Press banca", name_en="Bench press",
            instructions_es=["Paso 1"], instructions_en=["Step 1"],
            body_part=body_part, muscle=muscle,
        )
        self.exercise_b = Exercise.objects.create(
            slug="press-inclinado", name_es="Press inclinado", name_en="Incline press",
            instructions_es=["Paso 1"], instructions_en=["Step 1"],
            body_part=body_part, muscle=muscle,
        )

        self.routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        self.routine_day = RoutineDay.objects.create(routine=self.routine, name="Push", order=1)

        other_routine = Routine.objects.create(user=self.other_user, name="Otra rutina", description="")
        self.other_routine_day = RoutineDay.objects.create(routine=other_routine, name="Push", order=1)

    def _payload(self, exercise):
        return {
            "exercise": exercise.id,
            "target_sets": 3,
            "min_reps": 8,
            "max_reps": 12,
            "target_rir": 2,
            "rest_time": 90,
        }

    def test_first_exercise_gets_order_one(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "days_exercise-list",
            kwargs={"routine_pk": self.routine.pk, "routine_day_pk": self.routine_day.pk},
        )

        response = self.client.post(url, self._payload(self.exercise_a))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["order"], 1)

    def test_second_exercise_continues_the_sequence(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "days_exercise-list",
            kwargs={"routine_pk": self.routine.pk, "routine_day_pk": self.routine_day.pk},
        )

        self.client.post(url, self._payload(self.exercise_a))
        response = self.client.post(url, self._payload(self.exercise_b))

        self.assertEqual(response.data["order"], 2)

    def test_cannot_create_exercise_under_another_users_routine_day(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "days_exercise-list",
            kwargs={
                "routine_pk": self.other_routine_day.routine.pk,
                "routine_day_pk": self.other_routine_day.pk,
            },
        )

        response = self.client.post(url, self._payload(self.exercise_a))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)