from django.contrib import admin

from exercises.models import BodyPart, Equipment, Muscle, Exercise

@admin.register(BodyPart)
class BodyPartAdmin(admin.ModelAdmin):
    list_display = ("name_es", "name_en")
    list_filter = ("name_es",)

@admin.register(Equipment)
class BodyPartAdmin(admin.ModelAdmin):
    list_display = ("name_es", "name_en")
    list_filter = ("name_es",)

@admin.register(Muscle)
class BodyPartAdmin(admin.ModelAdmin):
    list_display = ("name_es", "name_en")
    list_filter = ("name_es",)

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ("name_es", "name_en", "muscle")
    list_filter = ("muscle",)
    search_fields = ("name_es", "name_en")
    # El catálogo no tiene dueño: no se puede asignar un ejercicio a un usuario desde aquí
    exclude = ("owner",)

    def get_queryset(self, request):
        # Solo el catálogo: los ejercicios propios son datos privados de cada usuario
        return super().get_queryset(request).filter(owner__isnull=True)