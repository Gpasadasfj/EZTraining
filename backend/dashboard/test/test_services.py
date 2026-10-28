from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from exercises.models import BodyPart, Muscle, Exercise
from routines.models import Routine, RoutineDay, RoutineExercise
from workouts.models import Workout, WorkoutExercise, WorkoutSet
from dashboard.services import (
    get_next_workout,
    get_number_and_target_of_workouts_this_week,
    get_personal_records,
    get_workouts_this_week,
    get_volume_this_week,
)

User = get_user_model()


class GetNextWorkoutTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
        )

        body_part = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")
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

        self.day_1 = RoutineDay.objects.create(routine=self.routine, name="Push", order=1)
        self.day_2 = RoutineDay.objects.create(routine=self.routine, name="Pull", order=2)
        self.day_3 = RoutineDay.objects.create(routine=self.routine, name="Legs", order=3)

        # Los días sin ejercicios se saltan, así que cada día necesita al menos uno
        for day in (self.day_1, self.day_2, self.day_3):
            self.add_exercise(day, self.exercise_1, order=1, target_sets=3)

    def add_exercise(self, day, exercise, order, target_sets):
        RoutineExercise.objects.create(
            routine_day=day,
            exercise=exercise,
            order=order,
            target_sets=target_sets,
            min_reps=8,
            max_reps=12,
            target_rir=2,
            rest_time=90,
        )

    def test_returns_none_when_there_is_no_routine(self):
        result = get_next_workout(None, None)

        self.assertIsNone(result)

    def test_returns_first_day_when_there_is_no_last_workout(self):
        result = get_next_workout(self.routine, None)

        self.assertEqual(result["routine_day"], self.day_1.id)
        self.assertEqual(result["name"], "Push")

    def test_returns_next_day_in_order(self):
        last_workout = Workout.objects.create(
            user=self.user,
            routine_day=self.day_1,
            completed=True,
        )

        result = get_next_workout(self.routine, last_workout)

        self.assertEqual(result["routine_day"], self.day_2.id)
        self.assertEqual(result["name"], "Pull")
        self.assertEqual(result["routine_name"], "Rutina fuerza")

    def test_wraps_around_to_first_day_after_last_day(self):
        last_workout = Workout.objects.create(
            user=self.user,
            routine_day=self.day_3,
            completed=True,
        )

        result = get_next_workout(self.routine, last_workout)

        self.assertEqual(result["routine_day"], self.day_1.id)
        self.assertEqual(result["name"], "Push")

    def test_skips_days_without_exercises(self):
        RoutineDay.objects.create(routine=self.routine, name="Core", order=4)
        last_workout = Workout.objects.create(
            user=self.user,
            routine_day=self.day_3,
            completed=True,
        )

        result = get_next_workout(self.routine, last_workout)

        # Después de Legs iría Core, pero está vacío: vuelve a Push
        self.assertEqual(result["name"], "Push")

    def test_starts_from_first_day_when_last_workout_is_from_another_routine(self):
        other_routine = Routine.objects.create(user=self.user, name="Otra", description="")
        other_day = RoutineDay.objects.create(routine=other_routine, name="Full body", order=5)
        last_workout = Workout.objects.create(
            user=self.user,
            routine_day=other_day,
            completed=True,
        )

        result = get_next_workout(self.routine, last_workout)

        self.assertEqual(result["name"], "Push")

    def test_counts_exercises_and_sets_of_next_day(self):
        self.add_exercise(self.day_2, self.exercise_2, order=2, target_sets=4)
        last_workout = Workout.objects.create(
            user=self.user,
            routine_day=self.day_1,
            completed=True,
        )

        result = get_next_workout(self.routine, last_workout)

        self.assertEqual(result["exercises_count"], 2)
        self.assertEqual(result["sets_count"], 7)


class GetPersonalRecordsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
        )

        chest = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        BodyPart.objects.create(name_es="Espalda", name_en="Back", slug="back")
        muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")

        self.press_banca = Exercise.objects.create(
            slug="press-banca",
            name_es="Press banca",
            name_en="Bench press",
            instructions_es=["Paso 1"],
            instructions_en=["Step 1"],
            body_part=chest,
            muscle=muscle,
        )
        self.press_inclinado = Exercise.objects.create(
            slug="press-inclinado",
            name_es="Press inclinado",
            name_en="Incline press",
            instructions_es=["Paso 1"],
            instructions_en=["Step 1"],
            body_part=chest,
            muscle=muscle,
        )

        routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        routine_day = RoutineDay.objects.create(routine=routine, name="Push", order=1)
        workout = Workout.objects.create(user=self.user, routine_day=routine_day, completed=True)

        self.we_press_banca = WorkoutExercise.objects.create(
            workout=workout, exercise=self.press_banca, order=1,
            target_sets=1, min_reps=1, max_reps=1, target_rir=1, rest_time=60,
        )
        self.we_press_inclinado = WorkoutExercise.objects.create(
            workout=workout, exercise=self.press_inclinado, order=2,
            target_sets=1, min_reps=1, max_reps=1, target_rir=1, rest_time=60,
        )

    def test_returns_empty_dict_for_body_part_without_sets(self):
        records = get_personal_records(self.user)

        self.assertEqual(records["chest"], {})
        self.assertEqual(records["back"], {})
        self.assertEqual(records["legs"], {})

    def test_picks_the_heaviest_set_across_exercises_of_the_same_body_part(self):
        WorkoutSet.objects.create(
            workout_exercise=self.we_press_banca, set_number=1, weight=80, reps=8, completed=True,
        )
        WorkoutSet.objects.create(
            workout_exercise=self.we_press_inclinado, set_number=1, weight=100, reps=5, completed=True,
        )

        records = get_personal_records(self.user)

        self.assertEqual(records["chest"]["exercise"], "Press inclinado")
        self.assertEqual(records["chest"]["weight"], 100)
        self.assertEqual(records["chest"]["reps"], 5)
        self.assertEqual(records["back"], {})

    def test_ignores_sets_not_completed(self):
        WorkoutSet.objects.create(
            workout_exercise=self.we_press_banca, set_number=1, weight=80, reps=8, completed=True,
        )
        WorkoutSet.objects.create(
            workout_exercise=self.we_press_inclinado, set_number=1, weight=200, reps=1, completed=False,
        )

        records = get_personal_records(self.user)

        self.assertEqual(records["chest"]["exercise"], "Press banca")
        self.assertEqual(records["chest"]["weight"], 80)

    def test_breaks_weight_ties_by_reps(self):
        WorkoutSet.objects.create(
            workout_exercise=self.we_press_banca, set_number=1, weight=100, reps=5, completed=True,
        )
        WorkoutSet.objects.create(
            workout_exercise=self.we_press_banca, set_number=2, weight=100, reps=8, completed=True,
        )

        records = get_personal_records(self.user)

        self.assertEqual(records["chest"]["weight"], 100)
        self.assertEqual(records["chest"]["reps"], 8)

    def test_ignores_sets_from_other_users(self):
        other_user = User.objects.create_user(
            username="otheruser",
            email="other@test.com",
            password="testpass123",
        )
        other_routine = Routine.objects.create(user=other_user, name="Otra", description="")
        other_day = RoutineDay.objects.create(routine=other_routine, name="Push", order=1)
        other_workout = Workout.objects.create(user=other_user, routine_day=other_day, completed=True)
        other_we = WorkoutExercise.objects.create(
            workout=other_workout, exercise=self.press_banca, order=1,
            target_sets=1, min_reps=1, max_reps=1, target_rir=1, rest_time=60,
        )
        WorkoutSet.objects.create(
            workout_exercise=other_we, set_number=1, weight=150, reps=3, completed=True,
        )

        records = get_personal_records(self.user)

        self.assertEqual(records["chest"], {})


class GetVolumeThisWeekTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
        )

        body_part = BodyPart.objects.create(name_es="Pecho", name_en="Chest", slug="chest")
        muscle = Muscle.objects.create(name_es="Pectoral", name_en="Pectoralis", slug="pectoralis")
        exercise = Exercise.objects.create(
            slug="press-banca",
            name_es="Press banca",
            name_en="Bench press",
            instructions_es=["Paso 1"],
            instructions_en=["Step 1"],
            body_part=body_part,
            muscle=muscle,
        )

        routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        routine_day = RoutineDay.objects.create(routine=routine, name="Push", order=1)
        workout = Workout.objects.create(user=self.user, routine_day=routine_day, completed=True)

        self.workout_exercise = WorkoutExercise.objects.create(
            workout=workout, exercise=exercise, order=1,
            target_sets=1, min_reps=1, max_reps=1, target_rir=1, rest_time=60,
        )
        self.workouts = get_workouts_this_week(self.user)

    def test_returns_zero_when_there_are_no_sets(self):
        total = get_volume_this_week(self.workouts)

        self.assertEqual(total, 0)

    def test_sums_weight_times_reps_across_sets(self):
        WorkoutSet.objects.create(
            workout_exercise=self.workout_exercise, set_number=1, weight=80, reps=8, completed=True,
        )
        WorkoutSet.objects.create(
            workout_exercise=self.workout_exercise, set_number=2, weight=90, reps=6, completed=True,
        )

        total = get_volume_this_week(self.workouts)

        self.assertEqual(total, 80 * 8 + 90 * 6)

    def test_excludes_sets_not_completed(self):
        WorkoutSet.objects.create(
            workout_exercise=self.workout_exercise, set_number=1, weight=80, reps=8, completed=True,
        )
        WorkoutSet.objects.create(
            workout_exercise=self.workout_exercise, set_number=2, weight=90, reps=6, completed=False,
        )

        total = get_volume_this_week(self.workouts)

        self.assertEqual(total, 80 * 8)


class GetNumberAndTargetOfWorkoutsThisWeekTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
        )

        self.routine = Routine.objects.create(user=self.user, name="Rutina", description="")
        self.day_1 = RoutineDay.objects.create(routine=self.routine, name="Push", order=1)
        self.day_2 = RoutineDay.objects.create(routine=self.routine, name="Pull", order=2)
        self.day_3 = RoutineDay.objects.create(routine=self.routine, name="Legs", order=3)

    def test_returns_none_target_when_there_is_no_routine(self):
        workouts = get_workouts_this_week(self.user)

        number, target, days = get_number_and_target_of_workouts_this_week(workouts, None)

        self.assertEqual(number, 0)
        self.assertIsNone(target)
        self.assertEqual(days, [])

    def test_returns_target_based_on_routine_days_count(self):
        Workout.objects.create(user=self.user, routine_day=self.day_1, completed=True)
        Workout.objects.create(user=self.user, routine_day=self.day_2, completed=True)
        workouts = get_workouts_this_week(self.user)

        number, target, days = get_number_and_target_of_workouts_this_week(workouts, self.routine)

        self.assertEqual(number, 2)
        self.assertEqual(target, 3)
        # Los dos entrenos son de hoy: el día aparece una sola vez
        self.assertEqual(days, [timezone.localdate().weekday()])


class GetWorkoutsThisWeekTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
        )

    def test_includes_completed_workout_from_this_week(self):
        Workout.objects.create(user=self.user, completed=True)

        workouts = get_workouts_this_week(self.user)

        self.assertEqual(workouts.count(), 1)

    def test_excludes_workout_not_completed(self):
        Workout.objects.create(user=self.user, completed=False)

        workouts = get_workouts_this_week(self.user)

        self.assertEqual(workouts.count(), 0)

    def test_excludes_workout_from_last_week(self):
        workout = Workout.objects.create(user=self.user, completed=True)
        last_week = timezone.now() - timedelta(days=8)
        Workout.objects.filter(pk=workout.pk).update(started_at=last_week)

        workouts = get_workouts_this_week(self.user)

        self.assertEqual(workouts.count(), 0)

    def test_excludes_workouts_from_other_users(self):
        other_user = User.objects.create_user(
            username="otheruser",
            email="other@test.com",
            password="testpass123",
        )
        Workout.objects.create(user=other_user, completed=True)

        workouts = get_workouts_this_week(self.user)

        self.assertEqual(workouts.count(), 0)