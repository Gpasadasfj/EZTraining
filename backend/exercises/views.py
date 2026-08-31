from django.shortcuts import render
import django_filters
from rest_framework import generics

from exercises.models import Equipment, Exercise, Muscle
from exercises.serializers import ExerciseSerializer

class ExerciseFilter(django_filters.FilterSet):
    equipment = django_filters.ModelMultipleChoiceFilter(
        field_name="equipment",
        queryset=Equipment.objects.all(),
        method="filter_all",
    )
    secondary_muscles = django_filters.ModelMultipleChoiceFilter(
        field_name="secondary_muscles",
        queryset=Muscle.objects.all(),
        method="filter_all",
    )
    
    def filter_all(self, queryset, name, value):
        for item in value:
            queryset = queryset.filter(**{name: item})
        return queryset

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

class ExerciseDetailView(generics.RetrieveAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    lookup_field = "slug"
    