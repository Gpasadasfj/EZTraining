from core.permissions import IsOwner


class IsWorkoutExerciseOwner(IsOwner):
    owner_path = "workout.user"

class IsWorkoutSetOwner(IsOwner):
    owner_path = "workout_exercise.workout.user"