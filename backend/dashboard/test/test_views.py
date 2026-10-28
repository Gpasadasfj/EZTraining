from django.utils import timezone

from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse

from exercises.models import BodyPart, Muscle, Exercise
from routines.models import Routine, RoutineDay, RoutineExercise
from workouts.models import Workout
from workouts.services import start_workout

User = get_user_model()


class DashboardViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )

    def test_unauthenticated_user_cannot_access_dashboard(self):
        url = reverse("dashboard")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_for_a_user_with_no_workouts(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("dashboard")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data["workouts_this_week"], 0)
        self.assertIsNone(data["target_workouts"])
        self.assertEqual(data["volume_this_week"], 0)
        self.assertIsNone(data["current_weight"])
        self.assertIsNone(data["next_workout"])
        self.assertEqual(data["personal_records"], {"chest": {}, "back": {}, "legs": {}})

    def test_dashboard_reflects_a_completed_workout(self):
        body_part = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")
        exercise = Exercise.objects.create(
            slug="press-banca", name_es="Press banca", name_en="Bench press",
            instructions_es=["Paso 1"], instructions_en=["Step 1"],
            body_part=body_part, muscle=muscle,
        )

        routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        day_1 = RoutineDay.objects.create(routine=routine, name="Push", order=1)
        day_2 = RoutineDay.objects.create(routine=routine, name="Pull", order=2)
        RoutineExercise.objects.create(
            routine_day=day_1, exercise=exercise, order=1,
            target_sets=1, min_reps=8, max_reps=12, target_rir=2, rest_time=90,
        )
        RoutineExercise.objects.create(
            routine_day=day_2, exercise=exercise, order=1,
            target_sets=1, min_reps=8, max_reps=12, target_rir=2, rest_time=90,
        )

        workout = start_workout(user=self.user, routine_day=day_1)
        Workout.objects.filter(pk=workout.pk).update(completed=True, finished_at=timezone.now())

        self.client.force_authenticate(user=self.user)
        url = reverse("dashboard")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data["workouts_this_week"], 1)
        self.assertEqual(data["target_workouts"], 2)
        self.assertEqual(data["next_workout"]["routine_day"], day_2.id)
        self.assertEqual(data["next_workout"]["name"], "Pull")