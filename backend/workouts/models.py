from django.db import models
from django.core.validators import MinValueValidator

from exercises.models import Exercise
from routines.models import RoutineDay
from users.models import User

class Workout(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    routine_day = models.ForeignKey(
        RoutineDay,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    routine_name = models.CharField(max_length=150, blank=True)
    routine_day_name = models.CharField(max_length=150, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(
        null=True,
        blank=True
    )
    duration = models.DurationField(
        null=True,
        blank=True
    )
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class WorkoutExercise(models.Model):
    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField()
    target_sets = models.PositiveIntegerField()
    min_reps = models.PositiveIntegerField()
    max_reps = models.PositiveIntegerField()
    target_rir = models.PositiveIntegerField()
    rest_time = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["workout", "order"],
                name="unique_set_order_per_workout",
            )
        ]

class WorkoutSet(models.Model):
    workout_exercise = models.ForeignKey(
        WorkoutExercise,
        on_delete=models.CASCADE
    )
    set_number = models.PositiveSmallIntegerField()
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)],
    )
    reps = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True
    )
    rir = models.PositiveIntegerField(
        blank=True,
        null=True
    )
    completed = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["workout_exercise", "set_number"],
                name="unique_set_number_per_exercise",
            )
        ]

