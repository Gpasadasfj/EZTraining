from django.db import transaction
from django.db.models import Count, Q
from django.db.models.aggregates import Max
from rest_framework import mixins, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core.permissions import IsOwner
from workouts.services import finish_workout, get_previous_workout_exercise, start_workout
from workouts.serializers import (
    ActiveWorkoutSerializer,
    PreviousSetSerializer,
    WorkoutExerciseSerializer,
    WorkoutSerializer,
    WorkoutSetSerializer,
)
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

        finish_workout(workout)

        serializer = self.get_serializer(workout)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def active(self, request):
        workout = (
            self.get_queryset()
            .filter(completed=False)
            .annotate(
                total_sets=Count("workoutexercise__workoutset"),
                completed_sets=Count(
                    "workoutexercise__workoutset",
                    filter=Q(workoutexercise__workoutset__completed=True),
                ),
            )
            .order_by("-started_at")
            .first()
        )

        if workout is None:
            return Response(None)

        serializer = ActiveWorkoutSerializer(workout, context=self.get_serializer_context())
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
        ).select_related("exercise", "workout")

    def perform_update(self, serializer):
        instance = serializer.instance
        new_order = serializer.validated_data.get("order")

        with transaction.atomic():
            if new_order is not None and new_order != instance.order:
                siblings = WorkoutExercise.objects.filter(workout_id=instance.workout_id)
                conflicting = siblings.filter(order=new_order).exclude(pk=instance.pk).first()

                if conflicting:
                    old_order = instance.order
                    temp_order = (siblings.aggregate(Max("order"))["order__max"] or 0) + 1

                    siblings.filter(pk=instance.pk).update(order=temp_order)

                    conflicting.order = old_order
                    conflicting.save(update_fields=["order"])

            serializer.save()

    @action(detail=True, methods=["get"])
    def previous(self, request, workout_pk=None, pk=None):
        previous = get_previous_workout_exercise(self.get_object())

        if previous is None:
            return Response({"finished_at": None, "sets": []})

        sets = previous.workoutset_set.filter(completed=True).order_by("set_number")
        return Response({
            "finished_at": previous.workout.finished_at,
            "sets": PreviousSetSerializer(sets, many=True).data,
        })

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