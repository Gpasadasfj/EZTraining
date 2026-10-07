from workouts.models import Workout

def get_last_workout(user):
    """Último entreno completado del usuario."""
    return (
        Workout.objects.filter(user=user, completed=True)
        .select_related("routine_day")
        .order_by("-started_at")
        .first()
    )

def get_active_routine_id(user):
    """Rutina en uso: la del último entreno completado."""
    last_workout = get_last_workout(user)
    if last_workout is None or last_workout.routine_day is None:
        return None
    return last_workout.routine_day.routine_id