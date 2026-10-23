from datetime import timedelta

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from exercises.models import BodyPart, Muscle, Exercise
from routines.models import Routine, RoutineDay, RoutineExercise
from workouts.models import Workout, WorkoutExercise, WorkoutSet
from workouts.services import finish_workout, get_previous_workout_exercise, start_workout

User = get_user_model()


class WorkoutTestData:
    """Usuario con una rutina de un día y dos ejercicios, compartido por las clases de tests."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
        )

        body_part = BodyPart.objects.create(
            name_es="Pecho", name_en="Chest", slug="chest"
        )
        muscle = Muscle.objects.create(
            name_es="Pectoral", name_en="Pectoralis", slug="pectoralis"
        )

        self.exercise_1 = Exercise.objects.create(
            slug="press-banca",
            name_es="Press banca",
            name_en="Bench press",
            instructions_es=["Paso 1"],
            instructions_en=["Step 1"],
            body_part=body_part,
            muscle=muscle,
        )
        self.exercise_2 = Exercise.objects.create(
            slug="press-inclinado",
            name_es="Press inclinado",
            name_en="Incline press",
            instructions_es=["Paso 1"],
            instructions_en=["Step 1"],
            body_part=body_part,
            muscle=muscle,
        )

        self.routine = Routine.objects.create(
            user=self.user,
            name="Rutina fuerza",
            description="Rutina de prueba",
        )
        self.routine_day = RoutineDay.objects.create(
            routine=self.routine,
            name="Push",
            order=1,
        )

        RoutineExercise.objects.create(
            routine_day=self.routine_day,
            exercise=self.exercise_1,
            order=1,
            target_sets=3,
            min_reps=8,
            max_reps=12,
            target_rir=2,
            rest_time=90,
        )
        RoutineExercise.objects.create(
            routine_day=self.routine_day,
            exercise=self.exercise_2,
            order=2,
            target_sets=4,
            min_reps=6,
            max_reps=10,
            target_rir=1,
            rest_time=120,
        )

    def complete_set(self, workout, exercise, set_number=1):
        workout_set = WorkoutSet.objects.get(
            workout_exercise__workout=workout,
            workout_exercise__exercise=exercise,
            set_number=set_number,
        )
        workout_set.weight = 80
        workout_set.reps = 8
        workout_set.rir = 2
        workout_set.completed = True
        workout_set.save()
        return workout_set

    def move_start(self, workout, days_ago):
        # started_at es auto_now_add: solo se puede cambiar con update()
        Workout.objects.filter(pk=workout.pk).update(
            started_at=timezone.now() - timedelta(days=days_ago)
        )
        workout.refresh_from_db()


class StartWorkoutTests(WorkoutTestData, TestCase):
    def test_start_workout_creates_workout_with_correct_data(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)

        self.assertEqual(workout.user, self.user)
        self.assertEqual(workout.routine_day, self.routine_day)
        self.assertEqual(workout.routine_name, self.routine.name)
        self.assertEqual(workout.routine_day_name, self.routine_day.name)
        self.assertFalse(workout.completed)

    def test_start_workout_creates_one_workout_exercise_per_routine_exercise(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)

        workout_exercises = WorkoutExercise.objects.filter(workout=workout).order_by("order")
        self.assertEqual(workout_exercises.count(), 2)

        first, second = workout_exercises
        self.assertEqual(first.exercise, self.exercise_1)
        self.assertEqual(first.target_sets, 3)
        self.assertEqual(first.rest_time, 90)

        self.assertEqual(second.exercise, self.exercise_2)
        self.assertEqual(second.target_sets, 4)

    def test_start_workout_creates_correct_number_of_sets(self):
        workout = start_workout(user=self.user, routine_day=self.routine_day)

        first_exercise = WorkoutExercise.objects.get(workout=workout, order=1)
        second_exercise = WorkoutExercise.objects.get(workout=workout, order=2)

        first_sets = WorkoutSet.objects.filter(workout_exercise=first_exercise).order_by("set_number")
        second_sets = WorkoutSet.objects.filter(workout_exercise=second_exercise).order_by("set_number")

        self.assertEqual(first_sets.count(), 3)
        self.assertEqual(second_sets.count(), 4)
        self.assertListEqual(
            list(first_sets.values_list("set_number", flat=True)),
            [1, 2, 3],
        )

        for workout_set in first_sets:
            self.assertIsNone(workout_set.weight)
            self.assertIsNone(workout_set.reps)
            self.assertIsNone(workout_set.rir)


class CloseActiveWorkoutTests(WorkoutTestData, TestCase):
    def test_previous_active_workout_without_progress_is_deleted(self):
        previous = start_workout(user=self.user, routine_day=self.routine_day)

        start_workout(user=self.user, routine_day=self.routine_day)

        self.assertFalse(Workout.objects.filter(pk=previous.pk).exists())
        self.assertEqual(Workout.objects.filter(user=self.user, completed=False).count(), 1)

    def test_previous_active_workout_with_completed_sets_is_finished(self):
        previous = start_workout(user=self.user, routine_day=self.routine_day)
        self.complete_set(previous, self.exercise_1)

        start_workout(user=self.user, routine_day=self.routine_day)

        previous.refresh_from_db()
        self.assertTrue(previous.completed)
        self.assertIsNotNone(previous.finished_at)
        self.assertEqual(Workout.objects.filter(user=self.user, completed=False).count(), 1)

    def test_set_with_weight_and_reps_counts_as_progress(self):
        previous = start_workout(user=self.user, routine_day=self.routine_day)
        workout_set = WorkoutSet.objects.filter(workout_exercise__workout=previous).first()
        workout_set.weight = 80
        workout_set.reps = 8
        workout_set.save()

        start_workout(user=self.user, routine_day=self.routine_day)

        previous.refresh_from_db()
        workout_set.refresh_from_db()
        self.assertTrue(previous.completed)
        self.assertTrue(workout_set.completed)

    def test_completed_workouts_are_kept(self):
        old = start_workout(user=self.user, routine_day=self.routine_day)
        finish_workout(old)

        start_workout(user=self.user, routine_day=self.routine_day)

        self.assertTrue(Workout.objects.filter(pk=old.pk, completed=True).exists())

    def test_other_users_active_workout_is_not_touched(self):
        other_user = User.objects.create_user(
            username="other", email="other@test.com", password="testpass123"
        )
        other_routine = Routine.objects.create(user=other_user, name="Otra", description="")
        other_day = RoutineDay.objects.create(routine=other_routine, name="Pull", order=1)
        other_workout = start_workout(user=other_user, routine_day=other_day)

        start_workout(user=self.user, routine_day=self.routine_day)

        self.assertTrue(Workout.objects.filter(pk=other_workout.pk, completed=False).exists())


class PreviousWorkoutExerciseTests(WorkoutTestData, TestCase):
    def finished_workout(self, days_ago, exercise):
        workout = start_workout(user=self.user, routine_day=self.routine_day)
        self.complete_set(workout, exercise)
        finish_workout(workout)
        self.move_start(workout, days_ago)
        return workout

    def workout_exercise(self, workout, exercise):
        return WorkoutExercise.objects.get(workout=workout, exercise=exercise)

    def test_returns_none_the_first_time(self):
        current = start_workout(user=self.user, routine_day=self.routine_day)

        previous = get_previous_workout_exercise(self.workout_exercise(current, self.exercise_1))

        self.assertIsNone(previous)

    def test_returns_most_recent_finished_workout(self):
        self.finished_workout(days_ago=7, exercise=self.exercise_1)
        newer = self.finished_workout(days_ago=2, exercise=self.exercise_1)
        current = start_workout(user=self.user, routine_day=self.routine_day)

        previous = get_previous_workout_exercise(self.workout_exercise(current, self.exercise_1))

        self.assertEqual(previous.workout, newer)

    def test_skips_workouts_without_completed_sets_of_that_exercise(self):
        with_sets = self.finished_workout(days_ago=7, exercise=self.exercise_1)
        self.finished_workout(days_ago=2, exercise=self.exercise_2)
        current = start_workout(user=self.user, routine_day=self.routine_day)

        previous = get_previous_workout_exercise(self.workout_exercise(current, self.exercise_1))

        self.assertEqual(previous.workout, with_sets)

    def test_ignores_workouts_started_later(self):
        first = self.finished_workout(days_ago=7, exercise=self.exercise_1)
        self.finished_workout(days_ago=2, exercise=self.exercise_1)

        previous = get_previous_workout_exercise(self.workout_exercise(first, self.exercise_1))

        self.assertIsNone(previous)