import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated

from exercises.models import Equipment, Exercise, Muscle
from exercises.permissions import IsOwnerOrReadOnly
from exercises.serializers import (
    EquipmentSerializer,
    ExerciseSerializer,
    ExerciseWriteSerializer,
    MuscleSerializer,
)


class ExerciseFilter(django_filters.FilterSet):
    equipment = django_filters.ModelMultipleChoiceFilter(
        field_name="equipment",
        queryset=Equipment.objects.all(),
        conjoined=True
    )
    secondary_muscles = django_filters.ModelMultipleChoiceFilter(
        field_name="secondary_muscles",
        queryset=Muscle.objects.all(),
        conjoined=True
    )
    # ?custom=true → solo los míos · ?custom=false → solo el catálogo
    custom = django_filters.BooleanFilter(
        field_name="owner",
        lookup_expr="isnull",
        exclude=True,
    )

    class Meta:
        model = Exercise
        fields = [
            "body_part",
            "muscle",
            "secondary_muscles",
            "equipment",
            "custom",
        ]


def visible_exercises(user):
    return (
        Exercise.objects.visible_to(user)
        .select_related("muscle", "body_part")
        .prefetch_related("secondary_muscles", "equipment")
    )


class ExerciseListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filterset_class = ExerciseFilter
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["name_es__unaccent"]

    def get_queryset(self):
        return visible_exercises(self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ExerciseWriteSerializer
        return ExerciseSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# Borrar un ejercicio propio lo quita de las rutinas (CASCADE) y deja
# los entrenos hechos con su nombre copiado (SET_NULL)
class ExerciseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return visible_exercises(self.request.user)

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ExerciseWriteSerializer
        return ExerciseSerializer


class MuscleListView(generics.ListAPIView):
    queryset = Muscle.objects.all().order_by("name_es")
    serializer_class = MuscleSerializer
    pagination_class = None


class EquipmentListView(generics.ListAPIView):
    queryset = Equipment.objects.all().order_by("name_es")
    serializer_class = EquipmentSerializer
    pagination_class = None