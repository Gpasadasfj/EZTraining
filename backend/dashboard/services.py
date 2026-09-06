from datetime import timedelta
from django.utils import timezone
from django.db.models import F, Max, Sum

from routines.models import RoutineDay, RoutineExercise
from workouts.models import Workout, WorkoutSet

def init_dashboard(user):
    # Inicializar dashboard
    workouts = get_workouts_this_week(user)
    last_workout = get_last_workout(user)


    number_of_workouts_this_week, target_workouts = get_number_and_target_of_workouts_this_week(workouts, last_workout)

    volume_this_week = get_volume_this_week(workouts)

    current_weight, target_weight = get_current_and_target_weight(user)

    next_workout = get_next_workout(last_workout)

    personal_records = get_personal_records(user)

    data = {
        "workouts_this_week" : number_of_workouts_this_week,
        "target_workouts" : target_workouts,
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
        started_at__date__gte=week_start
    )

    return week_workouts

def get_last_workout(user):
    # Obtener el último entreno del usuario
    return Workout.objects.filter(
        user=user, 
        completed=True
        ).order_by("-started_at").first()

def get_number_and_target_of_workouts_this_week(workouts, last_workout):
    # Entrenos realizados y objetivo de esta semana.
    number_of_workouts_this_week = workouts.count() # Entrenos realizados

    # Si todavía no hay entrenos devolvemos None
    if last_workout is None or last_workout.routine_day is None:
        return number_of_workouts_this_week, None 
    
    routine = last_workout.routine_day.routine
    target_workouts = RoutineDay.objects.filter( 
        routine=routine
        ).count() # Objetivo de entrenos sacado de los dias de entreno
                  # que tiene esta rutina

    return number_of_workouts_this_week, target_workouts

def get_volume_this_week(workouts):
    # Volumen total de esta semana
    total_volume = WorkoutSet.objects.filter(
        workout_exercise__workout__in=workouts, 
        weight__gte=0,
        reps__gte=0,
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

    data = {
        "routine_day" : next_workout.id,
        "routine_name" : next_workout.routine.name,
        "name" : next_workout.name,
    }

    return data

def get_personal_records(user):
    body_parts = ["chest", "back", "legs"]
    data = {}

    for body_part in body_parts:
        record = WorkoutSet.objects.filter(
            workout_exercise__workout__user=user,
            workout_exercise__exercise__body_part__name_es=body_part,
        ).order_by("-weight").first()

        if record is None:
            data[body_part] = {}
        else:
            data[body_part] = {
                "body_part": record.workout_exercise.exercise.body_part,
                "exercise": record.workout_exercise.exercise.name_es,
                "weight": record.weight,
                "reps": record.reps,
            }

    return data