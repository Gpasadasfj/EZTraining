from exercises.models import Exercise
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