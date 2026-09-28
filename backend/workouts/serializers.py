from rest_framework import serializers
from rest_framework.fields import empty

from routines.models import RoutineDay
from workouts.models import Workout, WorkoutExercise, WorkoutSet


class WorkoutSerializer(serializers.ModelSerializer):
    routine_day = serializers.PrimaryKeyRelatedField(
        queryset=RoutineDay.objects.all(),
        required=True,
        allow_null=False,
    )

    class Meta:
        model = Workout
        fields = [
            "id", "routine_day", "routine_name", "routine_day_name", "started_at", "finished_at", "duration", "completed", "created_at", "updated_at",
        ]
        read_only_fields = [
            "routine_name", "routine_day_name", "started_at", "created_at", "updated_at"
            ]

    def validate_routine_day(self, value):
        request = self.context.get("request")
        if value.routine.user != request.user:
            raise serializers.ValidationError("Este día de rutina no te pertenece.")
        return value

    def __init__(self, instance=None, data=empty, **kwargs):
        super().__init__(instance, data, **kwargs)
        request = self.context.get("request")
        self.fields["routine_day"].queryset = RoutineDay.objects.filter(routine__user=request.user)

class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source="exercise.name_es", read_only=True)
    exercise_image = serializers.ImageField(source="exercise.image", read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = [
            "id",
            "workout",
            "exercise",
            "exercise_name",
            "exercise_image",
            "order",
            "target_sets",
            "min_reps",
            "max_reps",
            "target_rir",
            "rest_time",
        ]
        read_only_fields = [
            "workout",
            "exercise",
            "target_sets",
            "min_reps",
            "max_reps",
            "target_rir",
            "rest_time",
        ]

class WorkoutSetSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkoutSet
        fields = [
            "id",
            "workout_exercise",
            "set_number",
            "weight",
            "reps",
            "rir",
        ]
        read_only_fields = [
            "workout_exercise",
            "set_number",
        ]