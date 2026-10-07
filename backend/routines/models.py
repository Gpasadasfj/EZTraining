from django.db import models

from exercises.models import Exercise
from users.models import User

class Routine(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
        )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["created_at", "id"]

class RoutineDay(models.Model):
    routine = models.ForeignKey(
        Routine,
        on_delete=models.CASCADE,
        related_name="days"
        )
    name = models.CharField(max_length=100)
    order = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["routine", "order"],
                name="unique_set_order_per_routine"
            )
        ]

class RoutineExercise(models.Model):
    routine_day = models.ForeignKey(
        RoutineDay,
        on_delete=models.CASCADE,
        related_name="routine_exercises"
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.PROTECT,
    )
    order = models.PositiveSmallIntegerField()
    target_sets = models.PositiveSmallIntegerField()
    min_reps = models.PositiveSmallIntegerField()
    max_reps = models.PositiveSmallIntegerField()
    target_rir = models.PositiveSmallIntegerField()
    rest_time = models.PositiveSmallIntegerField() # Seconds
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.routine_day.name} - {self.exercise.name_es}"

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["routine_day", "order"],
                name="unique_set_order_per_routine_day"
            )
        ]