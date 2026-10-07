from rest_framework import serializers

from .models import Routine, RoutineDay, RoutineExercise


class RoutineSerializer(serializers.ModelSerializer):
    n_days = serializers.IntegerField(read_only=True)
    n_exercises = serializers.IntegerField(read_only=True)
    n_sets = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Routine
        fields = [
            "id",
            "name",
            "description",
            "created_at",
            "updated_at",
            "n_days",
            "n_exercises",
            "n_sets",
            "is_active",
        ]
        read_only_fields = [
            "created_at",
            "updated_at",
        ]

class RoutineDaySerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(required=False, min_value=0)


    class Meta:
        model = RoutineDay
        fields = [
            "id",
            "routine",
            "name",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "routine",
            "created_at",
            "updated_at",
        ]

class RoutineExerciseSerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(required=False, min_value=0)
    exercise_name = serializers.CharField(source="exercise.name_es", read_only=True)
    exercise_image = serializers.ImageField(source="exercise.image", read_only=True)

    class Meta:
        model = RoutineExercise
        fields = [
            "id",
            "routine_day",
            "exercise",
            "exercise_name",
            "exercise_image",
            "order",
            "target_sets",
            "min_reps",
            "max_reps",
            "target_rir",
            "rest_time",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "routine_day",
            "created_at",
            "updated_at",
        ]

    def validate_exercise(self, value):
        user = self.context["request"].user
        if value.owner_id is not None and value.owner_id != user.id:
            raise serializers.ValidationError("Este ejercicio no existe.")
        return value

    def validate(self, attrs):
        min_reps = attrs.get("min_reps", getattr(self.instance, "min_reps", None))
        max_reps = attrs.get("max_reps", getattr(self.instance, "max_reps", None))
        if min_reps is not None and max_reps is not None and min_reps > max_reps:
            raise serializers.ValidationError(
                {"max_reps": "No puede ser menor que las repeticiones mínimas."}
            )
        return attrs