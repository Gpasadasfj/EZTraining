from django.db import transaction

from workouts.models import Workout, WorkoutExercise, WorkoutSet


@transaction.atomic
def start_workout(user, routine_day):
    '''
    Crear el workout y los ejercicios y series que cuelgan de el copiando
    los datos de routine_day a workout_exercise y creando las series en base
    al target_sets.
    '''
    workout = Workout.objects.create(
        user=user,
        routine_day=routine_day,
        routine_name=routine_day.routine.name,
        routine_day_name=routine_day.name
    )
    workout_sets = [] # Lista de todos los workout_sets para despues hacer
                      # bulk_create()

    for routine_exercise in routine_day.routine_exercises.all().order_by("order"): # Copiar los datos de routine_day a routine_exercise
        workout_exercise = WorkoutExercise.objects.create(
            workout=workout,
            exercise=routine_exercise.exercise,
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

