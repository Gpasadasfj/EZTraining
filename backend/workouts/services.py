from django.db import transaction
from django.db.models import Count, F, Prefetch, Q, Sum
from django.utils import timezone

from users.models import User
from workouts.models import Workout, WorkoutExercise, WorkoutSet


def finish_workout(workout):
    finished_at = timezone.now()

    with transaction.atomic():
        workout.finished_at = finished_at
        workout.duration = finished_at - workout.started_at
        workout.completed = True
        workout.save(update_fields=["finished_at", "duration", "completed", "updated_at"])

        # Las series con peso y reps cuentan aunque no se marcaran
        WorkoutSet.objects.filter(
            workout_exercise__workout=workout,
            completed=False,
            weight__isnull=False,
            reps__isnull=False,
        ).update(completed=True)

    return workout


@transaction.atomic
def close_active_workouts(user):
    '''
    Solo puede haber un entreno activo. El que haya se guarda si tiene
    progreso y si no se borra, para no dejar entrenos vacíos en el historial.
    '''
    # Bloquea al usuario hasta el final de la transacción: si llegan dos
    # "empezar" a la vez, el segundo espera a que el primero termine
    User.objects.select_for_update().get(pk=user.pk)

    for workout in Workout.objects.filter(user=user, completed=False):
        # Mismo criterio que finish_workout: hecha o con peso y reps
        has_progress = WorkoutSet.objects.filter(
            Q(completed=True) | Q(weight__isnull=False, reps__isnull=False),
            workout_exercise__workout=workout,
        ).exists()

        if has_progress:
            finish_workout(workout)
        else:
            workout.delete()


@transaction.atomic
def start_workout(user, routine_day):
    '''
    Crear el workout y los ejercicios y series que cuelgan de el copiando
    los datos de routine_day a workout_exercise y creando las series en base
    al target_sets.
    '''
    close_active_workouts(user)

    workout = Workout.objects.create(
        user=user,
        routine_day=routine_day,
        routine_name=routine_day.routine.name,
        routine_day_name=routine_day.name
    )
    workout_sets = [] # Lista de todos los workout_sets para despues hacer
                      # bulk_create()

    routine_exercises = routine_day.routine_exercises.select_related("exercise").order_by("order")
    for routine_exercise in routine_exercises: # Copiar los datos de routine_day a routine_exercise
        workout_exercise = WorkoutExercise.objects.create(
            workout=workout,
            exercise=routine_exercise.exercise,
            exercise_name=routine_exercise.exercise.name_es,
            order=routine_exercise.order,
            target_sets=routine_exercise.target_sets,
            min_reps=routine_exercise.min_reps,
            max_reps=routine_exercise.max_reps,
            target_rir=routine_exercise.target_rir,
            rest_time=routine_exercise.rest_time
        )

        for i in range(1, workout_exercise.target_sets +1):
            # Crear las series de cada ejercicio en base al target_sets
            # del WorkoutExercise
            workout_set = WorkoutSet(
                workout_exercise=workout_exercise,
                set_number=i,
            )
            workout_sets.append(workout_set)

    WorkoutSet.objects.bulk_create(workout_sets)

    return workout


def get_previous_workout_exercise(workout_exercise):
    '''
    El mismo ejercicio en el último entreno terminado anterior a este,
    ignorando los entrenos en los que no se completó ninguna serie suya.
    '''
    # Ejercicio borrado: no hay con qué comparar
    if workout_exercise.exercise_id is None:
        return None

    return (
        WorkoutExercise.objects.filter(
            workout__user_id=workout_exercise.workout.user_id,
            workout__completed=True,
            workout__started_at__lt=workout_exercise.workout.started_at,
            exercise_id=workout_exercise.exercise_id,
            workoutset__completed=True,
        )
        .select_related("workout")
        .order_by("-workout__started_at")
        .first()
    )

def get_workout_summary(workout_id):
    '''
    El entreno con sus totales calculados en la base de datos y, por cada
    ejercicio, solo sus series completadas en done_sets.
    '''
    done = Q(workoutexercise__workoutset__completed=True)

    exercises = WorkoutExercise.objects.select_related("exercise").prefetch_related(
        Prefetch(
            "workoutset_set",
            queryset=WorkoutSet.objects.filter(completed=True).order_by("set_number"),
            to_attr="done_sets",
        )
    )

    return (
        Workout.objects.filter(pk=workout_id)
        .annotate(
            total_sets=Count("workoutexercise__workoutset"),
            completed_sets=Count("workoutexercise__workoutset", filter=done),
            volume=Sum(
                F("workoutexercise__workoutset__weight") * F("workoutexercise__workoutset__reps"),
                filter=done,
            ),
        )
        .prefetch_related(Prefetch("workoutexercise_set", queryset=exercises))
        .get()
    )