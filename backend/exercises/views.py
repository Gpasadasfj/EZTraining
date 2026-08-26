from django.shortcuts import render
from rest_framework import generics

from exercises.models import Exercise
from exercises.serializers import ExerciseSerializer

class ExerciseListView(generics.ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class ExerciseDetailView(generics.RetrieveAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    lookup_field = "slug"
    