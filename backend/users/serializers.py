from rest_framework import serializers

from core.images import process_image
from .models import User, WeightLog

AVATAR_SIZE = 512


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "avatar"
        ]

    def validate_avatar(self, value):
        return process_image(value, AVATAR_SIZE, square=True)

    def create(self, validated_data):
        password = validated_data.pop("password")

        # Si viene avatar, Django guarda el archivo al hacer save()
        user = User(**validated_data)

        user.set_password(password)

        user.save()

        return user

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
            "height",
            "current_weight",
            "target_weight",
        ]

        read_only_fields = [
            "username",
            "email",
            # La foto tiene su propio endpoint (multipart) y el peso
            # actual sale siempre del último registro de peso
            "avatar",
            "current_weight",
        ]

    def validate_height(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "La altura debe ser mayor que 0."
            )

        return value

    def validate_target_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "El peso objetivo debe ser mayor que 0."
            )

        return value

class AvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField()

    def validate_avatar(self, value):
        return process_image(value, AVATAR_SIZE, square=True)

class WeightLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = WeightLog
        fields = [
            "id",
            "weight",
            "recorded_at",
            ]
        read_only_fields = [
            "recorded_at"
        ]