from django.db import transaction
from rest_framework import status
from rest_framework.decorators import APIView
from rest_framework.generics import DestroyAPIView, ListCreateAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken

from core.images import remove_image, replace_image
from core.permissions import IsOwner
from core.mixins import OwnerCreateMixin
from users.models import WeightLog

from .serializers import (
    AvatarSerializer,
    LogoutSerializer,
    RegisterSerializer,
    UserSerializer,
    WeightLogSerializer,
)

class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        # Acepta JSON o multipart: con foto, el frontend envía un FormData
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

class LogoutView(APIView):

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh = serializer.validated_data["refresh"]
        token = RefreshToken(refresh)
        token.blacklist()

        return Response(
            {"message" : "Logout realizado correctamente"},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):

    def get(self, request):
        # Con el request en el contexto, las URLs de las fotos salen completas
        serializer = UserSerializer(request.user, context={"request": request})

        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class AvatarView(APIView):
    """PUT sube o cambia la foto de perfil; DELETE la quita."""

    parser_classes = [MultiPartParser]

    def put(self, request):
        serializer = AvatarSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        replace_image(request.user, "avatar", serializer.validated_data["avatar"])

        return Response(UserSerializer(request.user, context={"request": request}).data)

    def delete(self, request):
        remove_image(request.user, "avatar")

        return Response(UserSerializer(request.user, context={"request": request}).data)


class WeightLogView(OwnerCreateMixin, ListCreateAPIView):
    serializer_class = WeightLogSerializer

    def get_queryset(self):
        return WeightLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        super().perform_create(serializer)

        weight_log = serializer.instance
        user = self.request.user
        user.current_weight = weight_log.weight
        user.save(update_fields=["current_weight"])


class WeightLogDeleteView(DestroyAPIView):
    serializer_class = WeightLogSerializer
    permission_classes = [IsAuthenticated, IsOwner] 

    def get_queryset(self):
        return WeightLog.objects.filter(user=self.request.user)

    @transaction.atomic
    def perform_destroy(self, instance):
        instance.delete()

        # El peso actual es siempre el del último registro que queda (o ninguno)
        user = self.request.user
        latest = WeightLog.objects.filter(user=user).first()
        user.current_weight = latest.weight if latest else None
        user.save(update_fields=["current_weight"])