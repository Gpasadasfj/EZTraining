from datetime import timedelta

from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone

from exercises.models import BodyPart, Exercise, Muscle
from workouts.services import start_workout
from routines.models import Routine, RoutineDay, RoutineExercise
from workouts.models import Workout, WorkoutExercise, WorkoutSet

User = get_user_model()


class WorkoutViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="user2", email="user2@test.com", password="testpass123"
        )

        self.routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        self.routine_day = RoutineDay.objects.create(routine=self.routine, name="Push", order=1)

        self.other_routine = Routine.objects.create(user=self.other_user, name="Otra rutina", description="")
        self.other_routine_day = RoutineDay.objects.create(routine=self.other_routine, name="Pull", order=1)

    def test_unauthenticated_user_cannot_list_workouts(self):
        url = reverse("workout-list")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_create_workout_from_own_routine_day(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("workout-list")

        response = self.client.post(url, {"routine_day": self.routine_day.id})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workout.objects.filter(user=self.user).count(), 1)

    def test_user_cannot_create_workout_from_other_users_routine_day(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("workout-list")

        response = self.client.post(url, {"routine_day": self.other_routine_day.id})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_cannot_see_another_users_workout(self):
        other_workout = Workout.objects.create(user=self.other_user, routine_day=self.other_routine_day)
        self.client.force_authenticate(user=self.user)
        url = reverse("workout-detail", kwargs={"pk": other_workout.pk})

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class WorkoutExerciseAndSetPermissionsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="user2", email="user2@test.com", password="testpass123"
        )

        body_part = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")
        exercise = Exercise.objects.create(
            slug="press-banca", name_es="Press banca", name_en="Bench press",
            instructions_es=["Paso 1"], instructions_en=["Step 1"],
            body_part=body_part, muscle=muscle,
        )

        routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        routine_day = RoutineDay.objects.create(routine=routine, name="Push", order=1)
        RoutineExercise.objects.create(
            routine_day=routine_day, exercise=exercise, order=1,
            target_sets=3, min_reps=8, max_reps=12, target_rir=2, rest_time=90,
        )

        self.workout = start_workout(user=self.user, routine_day=routine_day)
        self.workout_exercise = WorkoutExercise.objects.get(workout=self.workout)
        self.workout_set = WorkoutSet.objects.filter(workout_exercise=self.workout_exercise).first()

    def test_owner_can_retrieve_their_workout_exercise(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "workout-exercise-detail",
            kwargs={"workout_pk": self.workout.pk, "pk": self.workout_exercise.pk},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_other_user_cannot_retrieve_workout_exercise(self):
        self.client.force_authenticate(user=self.other_user)
        url = reverse(
            "workout-exercise-detail",
            kwargs={"workout_pk": self.workout.pk, "pk": self.workout_exercise.pk},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_other_user_cannot_retrieve_workout_set(self):
        self.client.force_authenticate(user=self.other_user)
        url = reverse(
            "workout-set-detail",
            kwargs={
                "workout_pk": self.workout.pk,
                "workout_exercise_pk": self.workout_exercise.pk,
                "pk": self.workout_set.pk,
            },
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_can_update_a_workout_set(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "workout-set-detail",
            kwargs={
                "workout_pk": self.workout.pk,
                "workout_exercise_pk": self.workout_exercise.pk,
                "pk": self.workout_set.pk,
            },
        )

        response = self.client.patch(url, {"weight": 80, "reps": 8, "rir": 2})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.workout_set.refresh_from_db()
        self.assertEqual(self.workout_set.weight, 80)

class WorkoutFinishActionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="user2", email="user2@test.com", password="testpass123"
        )

        routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        routine_day = RoutineDay.objects.create(routine=routine, name="Push", order=1)

        self.workout = Workout.objects.create(user=self.user, routine_day=routine_day)
        started_at = timezone.now() - timedelta(minutes=45)
        Workout.objects.filter(pk=self.workout.pk).update(started_at=started_at)
        self.workout.refresh_from_db()

    def test_finish_marks_workout_completed_with_duration(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("workout-finish", kwargs={"pk": self.workout.pk})

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.workout.refresh_from_db()
        self.assertTrue(self.workout.completed)
        self.assertIsNotNone(self.workout.finished_at)
        self.assertAlmostEqual(self.workout.duration.total_seconds(), 45 * 60, delta=5)

    def test_finish_cannot_be_called_twice(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("workout-finish", kwargs={"pk": self.workout.pk})
        self.client.post(url)

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_user_cannot_finish_someone_elses_workout(self):
        self.client.force_authenticate(user=self.other_user)
        url = reverse("workout-finish", kwargs={"pk": self.workout.pk})

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)