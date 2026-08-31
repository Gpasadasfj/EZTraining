from django.utils import timezone
from rest_framework import mixins, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core.permissions import IsOwner
from workouts.services import start_workout
from workouts.serializers import WorkoutExerciseSerializer, WorkoutSerializer, WorkoutSetSerializer
from workouts.permisions import IsWorkoutExerciseOwner, IsWorkoutSetOwner
from workouts.models import Workout, WorkoutExercise, WorkoutSet

class WorkoutViewSet(ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Workout.objects.filter(
            user=self.request.user,
        )

    def perform_create(self, serializer):
        routine_day = serializer.validated_data.get("routine_day")
        workout = start_workout(
            user=self.request.user,
            routine_day=routine_day
            )
        serializer.instance = workout

    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        workout = self.get_object()

        # ¡Ya estaba completado? -> error
        if workout.completed:
            raise serializers.ValidationError("Este entreno ya está completado.")
        
        # Calcular finished_at y duration
        finished_at = timezone.now()
        duration = finished_at - workout.started_at

        # Guardar los cambios
        workout.finished_at = finished_at
        workout.duration = duration
        workout.completed = True
        workout.save(
            update_fields=[
                "finished_at", "duration", "completed", "updated_at"
                ]
            )

        # Devolver una respuesta
        serializer = self.get_serializer(workout)
        return Response(serializer.data)

class WorkoutExerciseViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = WorkoutExerciseSerializer 
    permission_classes = [IsAuthenticated, IsWorkoutExerciseOwner]

    def get_queryset(self):
        return WorkoutExercise.objects.filter(
            workout__user=self.request.user,
            workout__id=self.kwargs["workout_pk"]
        )

class WorkoutSetViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = WorkoutSetSerializer
    permission_classes = [IsAuthenticated, IsWorkoutSetOwner]

    def get_queryset(self):
        return WorkoutSet.objects.filter(
            workout_exercise=self.kwargs["workout_exercise_pk"],
            workout_exercise__workout__user=self.request.user,
            workout_exercise__workout__id=self.kwargs["workout_pk"]
        )