from routines.models import Routine
from workouts.models import Workout

def get_last_workout(user):
    """Último entreno completado del usuario."""
    return (
        Workout.objects.filter(user=user, completed=True)
        .select_related("routine_day__routine")
        .order_by("-started_at")
        .first()
    )

def get_active_routine(user):
    """
    Rutina en uso: la del último entreno completado. Si todavía no has
    entrenado (o ese día ya no existe), la última rutina que creaste.
    """
    last_workout = get_last_workout(user)
    if last_workout is not None and last_workout.routine_day is not None:
        return last_workout.routine_day.routine
    return Routine.objects.filter(user=user).order_by("-created_at").first()

def get_active_routine_id(user):
    routine = get_active_routine(user)
    return routine.id if routine is not None else None