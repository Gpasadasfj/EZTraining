from datetime import timedelta
from decimal import Decimal

from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone

from exercises.models import BodyPart, Exercise, Muscle
from workouts.services import finish_workout, start_workout
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

        body_part = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")
        exercise = Exercise.objects.create(
            slug="press-banca", name_es="Press banca", name_en="Bench press",
            instructions_es=["Paso 1"], instructions_en=["Step 1"],
            body_part=body_part, muscle=muscle,
        )

        self.routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        self.routine_day = RoutineDay.objects.create(routine=self.routine, name="Push", order=1)
        RoutineExercise.objects.create(
            routine_day=self.routine_day, exercise=exercise, order=1,
            target_sets=3, min_reps=8, max_reps=12, target_rir=2, rest_time=90,
        )
        self.empty_day = RoutineDay.objects.create(routine=self.routine, name="Pull", order=2)

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

    def test_cannot_start_workout_from_day_without_exercises(self):
        active = start_workout(user=self.user, routine_day=self.routine_day)
        self.client.force_authenticate(user=self.user)
        url = reverse("workout-list")

        response = self.client.post(url, {"routine_day": self.empty_day.id})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("routine_day", response.data)
        # El entreno activo sigue intacto
        self.assertTrue(Workout.objects.filter(pk=active.pk, completed=False).exists())

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

class ActiveAndPreviousEndpointsTests(APITestCase):
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
        self.routine_day = RoutineDay.objects.create(routine=routine, name="Push", order=1)
        RoutineExercise.objects.create(
            routine_day=self.routine_day, exercise=exercise, order=1,
            target_sets=3, min_reps=8, max_reps=12, target_rir=2, rest_time=90,
        )

    def complete_set(self, workout, set_number, weight, reps):
        workout_set = WorkoutSet.objects.get(
            workout_exercise__workout=workout, set_number=set_number
        )
        workout_set.weight = weight
        workout_set.reps = reps
        workout_set.completed = True
        workout_set.save()

    def previous_url(self, workout):
        workout_exercise = WorkoutExercise.objects.get(workout=workout)
        return reverse(
            "workout-exercise-previous",
            kwargs={"workout_pk": workout.pk, "pk": workout_exercise.pk},
        )

    def test_active_returns_null_without_active_workout(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("workout-active"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data)

    def test_active_returns_workout_with_set_counts(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)
        self.complete_set(workout, set_number=1, weight=80, reps=8)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("workout-active"))

        self.assertEqual(response.data["id"], workout.id)
        self.assertEqual(response.data["total_sets"], 3)
        self.assertEqual(response.data["completed_sets"], 1)

    def test_active_does_not_return_other_users_workout(self):
        start_workout(user=self.user, routine_day=self.routine_day)
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(reverse("workout-active"))

        self.assertIsNone(response.data)

    def test_workout_exercise_includes_exercise_slug(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)
        workout_exercise = WorkoutExercise.objects.get(workout=workout)
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "workout-exercise-detail",
            kwargs={"workout_pk": workout.pk, "pk": workout_exercise.pk},
        )

        response = self.client.get(url)

        self.assertEqual(response.data["exercise_slug"], "press-banca")

    def test_previous_is_empty_the_first_time(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.previous_url(workout))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"finished_at": None, "sets": []})

    def test_previous_returns_completed_sets_of_last_workout(self):
        old = start_workout(user=self.user, routine_day=self.routine_day)
        self.complete_set(old, set_number=1, weight=80, reps=8)
        self.complete_set(old, set_number=2, weight="82.5", reps=6)
        finish_workout(old)
        Workout.objects.filter(pk=old.pk).update(started_at=timezone.now() - timedelta(days=3))
        current = start_workout(user=self.user, routine_day=self.routine_day)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.previous_url(current))

        self.assertIsNotNone(response.data["finished_at"])
        sets = response.data["sets"]
        self.assertEqual([s["set_number"] for s in sets], [1, 2])
        self.assertEqual(Decimal(sets[1]["weight"]), Decimal("82.5"))

    def test_other_user_cannot_get_previous(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(self.previous_url(workout))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_summary_returns_totals_and_completed_sets(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)
        self.complete_set(workout, set_number=1, weight=80, reps=8)
        self.complete_set(workout, set_number=2, weight="82.5", reps=6)
        finish_workout(workout)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("workout-summary", kwargs={"pk": workout.pk}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_sets"], 3)
        self.assertEqual(response.data["completed_sets"], 2)
        # 80×8 + 82,5×6 = 640 + 495
        self.assertEqual(Decimal(response.data["volume"]), Decimal("1135"))
        self.assertEqual(len(response.data["exercises"][0]["sets"]), 2)
        self.assertIsInstance(response.data["duration_seconds"], int)

    def test_other_user_cannot_get_summary(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(reverse("workout-summary", kwargs={"pk": workout.pk}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_history_lists_only_finished_workouts_newest_first(self):
        older = start_workout(user=self.user, routine_day=self.routine_day)
        finish_workout(older)
        Workout.objects.filter(pk=older.pk).update(started_at=timezone.now() - timedelta(days=3))
        newer = start_workout(user=self.user, routine_day=self.routine_day)
        finish_workout(newer)
        start_workout(user=self.user, routine_day=self.routine_day)  # en curso: no sale
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("workout-history"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual([w["id"] for w in response.data["results"]], [newer.id, older.id])

    def test_history_includes_set_totals_and_volume(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)
        self.complete_set(workout, set_number=1, weight=80, reps=8)
        finish_workout(workout)
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse("workout-history"))

        item = response.data["results"][0]
        self.assertEqual(item["total_sets"], 3)
        self.assertEqual(item["completed_sets"], 1)
        self.assertEqual(Decimal(item["volume"]), Decimal("640"))
        self.assertIsInstance(item["duration_seconds"], int)

    def test_history_excludes_other_users_workouts(self):
        finish_workout(start_workout(user=self.user, routine_day=self.routine_day))
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(reverse("workout-history"))

        self.assertEqual(response.data["count"], 0)