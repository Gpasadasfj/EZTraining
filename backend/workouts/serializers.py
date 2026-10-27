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


class ActiveWorkoutSerializer(WorkoutSerializer):
    # Vienen anotados en la consulta de la vista "active"
    total_sets = serializers.IntegerField(read_only=True)
    completed_sets = serializers.IntegerField(read_only=True)

    class Meta(WorkoutSerializer.Meta):
        fields = WorkoutSerializer.Meta.fields + ["total_sets", "completed_sets"]


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source="exercise.name_es", read_only=True)
    exercise_slug = serializers.CharField(source="exercise.slug", read_only=True)
    exercise_image = serializers.ImageField(source="exercise.image", read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = [
            "id",
            "workout",
            "exercise",
            "exercise_name",
            "exercise_slug",
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
        fields = ["id", "workout_exercise", "set_number", "weight", "reps", "rir", "completed"]
        read_only_fields = ["workout_exercise", "set_number"]

    def validate(self, attrs):
        completed = attrs.get("completed", self.instance.completed if self.instance else False)
        if completed:
            errors = {}
            for field in ("weight", "reps"):
                if attrs.get(field, getattr(self.instance, field, None)) is None:
                    errors[field] = "Obligatorio para completar la serie."
            if errors:
                raise serializers.ValidationError(errors)
        return attrs


class SetValuesSerializer(serializers.ModelSerializer):
    """Solo los valores de una serie: para el último entreno y el resumen."""

    class Meta:
        model = WorkoutSet
        fields = ["set_number", "weight", "reps", "rir"]


class SummaryExerciseSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source="exercise.name_es", read_only=True)
    # done_sets lo crea el Prefetch de get_workout_summary
    sets = SetValuesSerializer(source="done_sets", many=True, read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = ["id", "exercise_name", "target_sets", "sets"]


class WorkoutSummarySerializer(serializers.ModelSerializer):
    # Vienen anotados en get_workout_summary
    total_sets = serializers.IntegerField(read_only=True)
    completed_sets = serializers.IntegerField(read_only=True)
    volume = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    duration_seconds = serializers.SerializerMethodField()
    exercises = SummaryExerciseSerializer(source="workoutexercise_set", many=True, read_only=True)

    class Meta:
        model = Workout
        fields = [
            "id",
            "routine_name",
            "routine_day_name",
            "started_at",
            "finished_at",
            "completed",
            "duration_seconds",
            "total_sets",
            "completed_sets",
            "volume",
            "exercises",
        ]

    def get_duration_seconds(self, obj):
        return int(obj.duration.total_seconds()) if obj.duration else None