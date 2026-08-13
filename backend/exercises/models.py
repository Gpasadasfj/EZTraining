from django.db import models

class BodyPart(models.Model):
    name_es = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

class Muscle(models.Model):
    name_es = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

class Equipment(models.Model):
    name_es = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

class Exercise(models.Model):
    source_id = models.PositiveIntegerField(
        unique=True,
        blank=True,
        null=True
    )
    slug = models.SlugField(unique=True)
    name_es = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    instructions_es = models.JSONField()
    instructions_en = models.JSONField()
    image = models.ImageField(
        null=True,
        blank=True
    )
    body_part = models.ForeignKey(
        BodyPart,
        on_delete=models.PROTECT
    )
    muscle = models.ForeignKey(
        Muscle,
        on_delete=models.PROTECT
    )
    secondary_muscles = models.ManyToManyField(
        Muscle,
        related_name="secondary_muscles"
    )
    equipment = models.ManyToManyField(
        Equipment
    )