from django.test import TestCase
from django.contrib.auth import get_user_model

from exercises.models import BodyPart, Muscle, Exercise
from routines.models import Routine, RoutineDay, RoutineExercise
from workouts.models import WorkoutExercise, WorkoutSet
from workouts.services import start_workout

User = get_user_model()


class StartWorkoutTests(TestCase):
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