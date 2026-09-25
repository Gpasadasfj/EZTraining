from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.shortcuts import render
import django_filters
from rest_framework import generics

from exercises.models import Equipment, Exercise, Muscle
from exercises.serializers import EquipmentSerializer, ExerciseSerializer, MuscleSerializer

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

    class Meta:
        model = Exercise
        fields = [
            "body_part", 
            "muscle", 
            "secondary_muscles", 
            "equipment"
            ]

class ExerciseListView(generics.ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    filterset_class = ExerciseFilter
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["name_es__unaccent"]

class ExerciseDetailView(generics.RetrieveAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    lookup_field = "slug"

class MuscleListView(generics.ListAPIView):
    queryset = Muscle.objects.all().order_by("name_es")
    serializer_class = MuscleSerializer
    pagination_class = None


class EquipmentListView(generics.ListAPIView):
    queryset = Equipment.objects.all().order_by("name_es")
    serializer_class = EquipmentSerializer
    pagination_class = None