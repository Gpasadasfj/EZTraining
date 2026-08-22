from rest_framework import serializers

from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password"
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

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
            "id",
            "username",
            "email",
        ]

    def validate_height(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "La altura debe ser mayor que 0."
            )

        return value

    def validate_current_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "El peso debe ser mayor que 0."
            )

        return value

    def validate_target_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "El peso objetivo debe ser mayor que 0."
            )

        return value