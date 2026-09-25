from exercises.models import Equipment, Exercise, Muscle
from rest_framework import serializers


class ExerciseSerializer(serializers.ModelSerializer):
    body_part = serializers.StringRelatedField()
    muscle = serializers.StringRelatedField()
    secondary_muscles = serializers.StringRelatedField(many=True)
    equipment = serializers.StringRelatedField(many=True)  

    class Meta:
        model = Exercise
        fields = [
            "id",
            "slug",
            "name_es",
            "instructions_es",
            "image",
            "body_part",
            "muscle",
            "secondary_muscles",
            "equipment",
        ]

class MuscleSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="__str__", read_only=True)

    class Meta:
        model = Muscle
        fields = ["id", "name"]


class EquipmentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="__str__", read_only=True)

    class Meta:
        model = Equipment
        fields = ["id", "name"]