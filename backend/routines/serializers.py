from rest_framework import serializers

from .models import Routine, RoutineDay, RoutineExercise


class RoutineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Routine
        fields = [
            "id",
            "user",
            "name",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "created_at",
            "updated_at",
        ]

class RoutineDaySerializer(serializers.ModelSerializer):

    class Meta:
        model = RoutineDay
        fields = [
            "id",
            "routine",
            "name",
            "order",
        ]
        read_only_fields = [
            "routine",
            "created_at",
            "updated_at",
        ]

class RoutineExerciseSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoutineExercise
        fields = [
            "id",
            "routine_day",
            "exercise",
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
