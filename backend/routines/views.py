from django.db import transaction
from django.db.models import BooleanField, Case, Value, When
from django.db.models.aggregates import Count, Max, Sum
from django.db.models.functions import Coalesce
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404

from routines.services import get_active_routine_id

from .permissions import IsRoutineDayOwner, IsRoutineExerciseOwner
from core.permissions import IsOwner
from core.mixins import OwnerCreateMixin
from .models import Routine, RoutineDay, RoutineExercise
from .serializers import RoutineDaySerializer, RoutineExerciseSerializer, RoutineSerializer


class RoutineViewSet(OwnerCreateMixin, ModelViewSet):
    serializer_class = RoutineSerializer
    permission_classes = [IsAuthenticated, IsOwner] 
    
    def get_queryset(self):
        user = self.request.user
        active_id = get_active_routine_id(user)
    
        return Routine.objects.filter(user=user).annotate(
            n_days=Count("days", distinct=True),
            n_exercises=Count("days__routine_exercises", distinct=True),
            n_sets=Coalesce(Sum("days__routine_exercises__target_sets"), 0),
            is_active=Case(
                    When(pk=active_id, then=Value(True)),
                    default=Value(False),
                    output_field=BooleanField(),
                ),
        ).order_by("-is_active", "created_at", "id")

class RoutineDayViewSet(ModelViewSet):
    serializer_class = RoutineDaySerializer
    permission_classes = [IsAuthenticated, IsRoutineDayOwner]

    def perform_create(self, serializer):
        routine = get_object_or_404(Routine, pk=self.kwargs["routine_pk"], user=self.request.user)

        with transaction.atomic():
            # Bloquea la rutina: dos creaciones a la vez no pueden calcular el mismo orden
            Routine.objects.select_for_update().filter(pk=routine.pk).first()
            last_order = RoutineDay.objects.filter(routine=routine).aggregate(Max("order"))["order__max"]
            serializer.save(routine=routine, order=(last_order or 0) + 1)

    def get_queryset(self):
        return RoutineDay.objects.filter(
            routine__id=self.kwargs["routine_pk"],
            routine__user=self.request.user
            )

    def perform_update(self, serializer):
        instance = serializer.instance
        new_order = serializer.validated_data.get("order")

        with transaction.atomic():
            if new_order is not None and new_order != instance.order:
                siblings = RoutineDay.objects.filter(routine=instance.routine)
                conflicting = siblings.filter(order=new_order).exclude(pk=instance.pk).first()

                if conflicting:
                    old_order = instance.order
                    temp_order = (siblings.aggregate(Max("order"))["order__max"] or 0) + 1

                    siblings.filter(pk=instance.pk).update(order=temp_order)

                    conflicting.order = old_order
                    conflicting.save(update_fields=["order"])

            serializer.save()

class RoutineExerciseViewSet(ModelViewSet):
    serializer_class = RoutineExerciseSerializer
    permission_classes = [IsAuthenticated, IsRoutineExerciseOwner]

    def perform_create(self, serializer):
        routine_day = get_object_or_404(
            RoutineDay, 
            pk=self.kwargs["routine_day_pk"], 
            routine__user=self.request.user,
            routine_id=self.kwargs["routine_pk"]
        )
        if serializer.validated_data.get("order") is None:
            last_order = RoutineExercise.objects.filter(routine_day=routine_day).aggregate(Max("order"))["order__max"]
            next_order = (last_order or 0) + 1
            serializer.save(routine_day=routine_day, order=next_order)
        else:
            serializer.save(routine_day=routine_day)

    def get_queryset(self):
        return RoutineExercise.objects.filter(
            routine_day=self.kwargs["routine_day_pk"],
            routine_day__routine=self.kwargs["routine_pk"],
            routine_day__routine__user=self.request.user,
        ).select_related("exercise")

    def perform_update(self, serializer):
        instance = serializer.instance
        new_order = serializer.validated_data.get("order")

        with transaction.atomic():
            if new_order is not None and new_order != instance.order:
                siblings = RoutineExercise.objects.filter(routine_day=instance.routine_day)
                conflicting = siblings.filter(order=new_order).exclude(pk=instance.pk).first()

                if conflicting:
                    old_order = instance.order
                    temp_order = (siblings.aggregate(Max("order"))["order__max"] or 0) + 1

                    siblings.filter(pk=instance.pk).update(order=temp_order)

                    conflicting.order = old_order
                    conflicting.save(update_fields=["order"])

            serializer.save()