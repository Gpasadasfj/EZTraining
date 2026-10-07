from datetime import timedelta
from django.utils import timezone
from django.db.models import F, Count,  Sum

from routines.services import get_last_workout
from routines.models import RoutineDay
from workouts.models import Workout, WorkoutSet

def init_dashboard(user):
    # Inicializar dashboard
    workouts = get_workouts_this_week(user)
    last_workout = get_last_workout(user)

    number_of_workouts_this_week, target_workouts, workout_days = get_number_and_target_of_workouts_this_week(workouts, last_workout)

    volume_this_week = get_volume_this_week(workouts)

    current_weight, target_weight = get_current_and_target_weight(user)

    next_workout = get_next_workout(last_workout)

    personal_records = get_personal_records(user)

    data = {
        "workouts_this_week" : number_of_workouts_this_week,
        "target_workouts" : target_workouts,
        "workout_days": workout_days,
        "volume_this_week" : volume_this_week,
        "current_weight" : current_weight,
        "target_weight" : target_weight,
        "next_workout" : next_workout,
        "personal_records" : personal_records,
    }

    return data

def get_workouts_this_week(user):
    # Entrenos de esta semana
    today = timezone.localdate()
    week_start = today - timedelta(days=today.weekday())

    # Filtrar por usuario y desde el lunes de esta semana
    week_workouts = Workout.objects.filter(
        user=user,
        started_at__date__gte=week_start,
        completed=True,
    )

    return week_workouts



def get_number_and_target_of_workouts_this_week(workouts, last_workout):
    # Entrenos realizados y objetivo de esta semana.
    number_of_workouts_this_week = workouts.count() # Entrenos realizados

    workout_days = sorted({
        timezone.localtime(workout.started_at).weekday()
        for workout in workouts
    }) # Días de entreno
    
    # Si todavía no hay entrenos devolvemos None
    if last_workout is None or last_workout.routine_day is None:
        return number_of_workouts_this_week, None , workout_days
    
    routine = last_workout.routine_day.routine
    target_workouts = RoutineDay.objects.filter( 
        routine=routine
        ).count() # Objetivo de entrenos sacado de los dias de entreno
                  # que tiene esta rutina

    return number_of_workouts_this_week, target_workouts, workout_days

def get_volume_this_week(workouts):
    # Volumen total de esta semana
    total_volume = WorkoutSet.objects.filter(
        workout_exercise__workout__in=workouts, 
        completed=True,
        ).aggregate(total=Sum(F("weight") * F("reps")))["total"] or 0
    

    return total_volume

def get_current_and_target_weight(user):
    # Peso actual y objetivo
    current_weight = user.current_weight
    target_weight = user.target_weight

    return current_weight, target_weight

def get_next_workout(last_workout):
    # Siguiente entreno
    if last_workout is None or last_workout.routine_day is None:
        return None

    routine = last_workout.routine_day.routine
    last_order = last_workout.routine_day.order

    next_workout = RoutineDay.objects.filter(
        routine=routine, order__gt=last_order
    ).order_by("order").first()

    if next_workout is None:
        next_workout = RoutineDay.objects.filter(routine=routine).order_by("order").first()

    if next_workout is None:
        return None

    stats = next_workout.routine_exercises.aggregate(
        exercises_count=Count("id"),
        sets_count=Sum("target_sets"),
    )

    data = {
        "routine_day" : next_workout.id,
        "routine_name" : next_workout.routine.name,
        "name" : next_workout.name,
        "exercises_count": stats["exercises_count"],
        "sets_count": stats["sets_count"] or 0,
    }

    return data

def get_personal_records(user):
    body_parts = ["chest", "back", "legs"]
    data = {}

    for body_part in body_parts:
        record = (
            WorkoutSet.objects.filter(
                workout_exercise__workout__user=user,
                workout_exercise__exercise__body_part__slug=body_part,
                completed=True,
                weight__isnull=False,
            )
            .select_related("workout_exercise__exercise__body_part")
            .order_by("-weight", "-reps")
            .first()
        )

        if record is None:
            data[body_part] = {}
        else:
            exercise = record.workout_exercise.exercise
            data[body_part] = {
                "body_part": exercise.body_part.name_es,
                "exercise": exercise.name_es,
                "weight": record.weight,
                "reps": record.reps,
            }

    return data