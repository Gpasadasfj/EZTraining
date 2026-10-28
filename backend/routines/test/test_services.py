from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from routines.models import Routine, RoutineDay
from routines.services import get_active_routine
from workouts.models import Workout

User = get_user_model()


class GetActiveRoutineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
        )

        self.older = Routine.objects.create(user=self.user, name="PPL", description="")
        self.newer = Routine.objects.create(user=self.user, name="Torso / Pierna", description="")
        # created_at es auto_now_add: se cambia con update() para fijar cuál es más antigua
        Routine.objects.filter(pk=self.older.pk).update(
            created_at=timezone.now() - timedelta(days=1)
        )

        self.older_day = RoutineDay.objects.create(routine=self.older, name="Push", order=1)

    def test_returns_none_without_routines(self):
        new_user = User.objects.create_user(
            username="new", email="new@test.com", password="testpass123"
        )

        self.assertIsNone(get_active_routine(new_user))

    def test_without_workouts_returns_latest_routine(self):
        self.assertEqual(get_active_routine(self.user), self.newer)

    def test_returns_routine_of_last_completed_workout(self):
        Workout.objects.create(user=self.user, routine_day=self.older_day, completed=True)

        self.assertEqual(get_active_routine(self.user), self.older)

    def test_ignores_workouts_not_completed(self):
        Workout.objects.create(user=self.user, routine_day=self.older_day, completed=False)

        self.assertEqual(get_active_routine(self.user), self.newer)

    def test_falls_back_to_latest_routine_when_last_workout_has_no_day(self):
        Workout.objects.create(user=self.user, routine_day=None, completed=True)

        self.assertEqual(get_active_routine(self.user), self.newer)