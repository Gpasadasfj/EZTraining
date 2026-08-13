from django.contrib import admin

from routines.models import Routine, RoutineDay, RoutineExercise

@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "created_at", "updated_at")
    list_filter = ("name",)

@admin.register(RoutineDay)
class RoutineDayAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "created_at", "updated_at")
    list_filter = ("name",)

@admin.register(RoutineExercise)
class RoutineExerciseAdmin(admin.ModelAdmin):
    pass
