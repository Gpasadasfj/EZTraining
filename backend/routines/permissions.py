from core.permissions import IsOwner


class IsRoutineDayOwner(IsOwner):
    owner_path = "routine.user"

class IsRoutineExerciseOwner(IsOwner):
    owner_path = "routine_day.routine.user"