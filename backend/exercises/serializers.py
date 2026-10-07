from uuid import uuid4

from django.utils.text import slugify
from rest_framework import serializers

from exercises.models import Equipment, Exercise, Muscle


def build_custom_slug(name):
    # SlugField tiene max_length=50: 40 del nombre + guion + 8 aleatorios
    base = slugify(name)[:40].strip("-") or "ejercicio"
    return f"{base}-{uuid4().hex[:8]}"


class ExerciseSerializer(serializers.ModelSerializer):
    body_part = serializers.StringRelatedField()
    muscle = serializers.StringRelatedField()
    secondary_muscles = serializers.StringRelatedField(many=True)
    equipment = serializers.StringRelatedField(many=True)
    is_custom = serializers.BooleanField(read_only=True)

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
            "is_custom",
        ]


class ExerciseWriteSerializer(serializers.ModelSerializer):
    """Crear y editar ejercicios propios. Un solo nombre, sin idiomas."""

    name = serializers.CharField(source="name_es", max_length=255)
    instructions = serializers.ListField(
        child=serializers.CharField(max_length=500),
        source="instructions_es",
        required=False,
    )
    muscle = serializers.PrimaryKeyRelatedField(queryset=Muscle.objects.all())
    secondary_muscles = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Muscle.objects.all(), required=False
    )
    equipment = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Equipment.objects.all(), required=False
    )

    class Meta:
        model = Exercise
        fields = [
            "name",
            "instructions",
            "image",
            "muscle",
            "secondary_muscles",
            "equipment",
        ]

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("El nombre no puede estar vacío.")

        user = self.context["request"].user
        duplicates = Exercise.objects.filter(owner=user, name_es__iexact=value)
        if self.instance:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError("Ya tienes un ejercicio con ese nombre.")
        return value

    def create(self, validated_data):
        validated_data["slug"] = build_custom_slug(validated_data["name_es"])
        return super().create(validated_data)

    def to_representation(self, instance):
        # Tras crear o editar, responde con el mismo formato que el listado
        return ExerciseSerializer(instance, context=self.context).data


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