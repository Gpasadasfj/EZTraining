from rest_framework import serializers

from .models import Routine, RoutineDay, RoutineExercise


class RoutineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Routine
        fields = [
            "id",
            "name",
            "description",
            "created_at",
            "updated_at",
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


    class Meta:
        model = RoutineExercise
        fields = [
            "id",
            "routine_day",
            "exercise",
            "exercise_name",
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
