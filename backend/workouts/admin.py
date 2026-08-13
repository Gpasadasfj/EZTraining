from django.contrib import admin

from workouts.models import Workout, WorkoutExercise, WorkoutSet

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ("user", "routine_day", "started_at", "duration", )
    list_filter = ("user",)

@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    list_display = ("workout", "exercise", "target_sets", "min_reps", "max_reps", "target_rir", "rest_time")

@admin.register(WorkoutSet)
class WorkoutSetAdmin(admin.ModelAdmin):
    list_display = ("workout_exercise", "set_number", "weight", "reps", "rir")

