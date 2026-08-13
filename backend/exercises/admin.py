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
class BodyPartAdmin(admin.ModelAdmin):
    list_display = ("name_es", "name_en")
    list_filter = ("name_es",)