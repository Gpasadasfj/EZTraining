from rest_framework import status
from rest_framework.decorators import APIView
from rest_framework.generics import DestroyAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken

from core.permissions import IsOwner
from core.mixins import OwnerCreateMixin
from users.models import WeightLog

from .serializers import RegisterSerializer, LogoutSerializer, UserSerializer, WeightLogSerializer

class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
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
        serializer = UserSerializer(request.user)

        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class WeightLogView(OwnerCreateMixin, ListCreateAPIView):
    serializer_class = WeightLogSerializer

    def get_queryset(self):
        return WeightLog.objects.filter(user=self.request.user)

class WeightLogDeleteView(DestroyAPIView):
    serializer_class = WeightLogSerializer
    permission_classes = [IsAuthenticated, IsOwner] 

    def get_queryset(self):
        return WeightLog.objects.filter(user=self.request.user)