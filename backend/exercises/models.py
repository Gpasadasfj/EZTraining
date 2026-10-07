from django.db import models
from django.db.models import Q

from users.models import User

class BodyPart(models.Model):
    name_es = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name_es


class Muscle(models.Model):
    name_es = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name_es


class Equipment(models.Model):
    name_es = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name_es


class ExerciseQuerySet(models.QuerySet):
    def visible_to(self, user):
        """Catálogo para todos y, además, los ejercicios propios del usuario."""
        if not user.is_authenticated:
            return self.filter(owner__isnull=True)
        return self.filter(Q(owner__isnull=True) | Q(owner=user))


class Exercise(models.Model):
    source_id = models.CharField(
        max_length=64,
        unique=True,
        blank=True,
        null=True
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_exercises",
    )
    slug = models.SlugField(unique=True)
    name_es = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255, blank=True)
    instructions_es = models.JSONField(default=list, blank=True)
    instructions_en = models.JSONField(default=list, blank=True)
    image = models.ImageField(
        upload_to="exercises/",
        null=True,
        blank=True
    )
    body_part = models.ForeignKey(
        BodyPart,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    muscle = models.ForeignKey(
        Muscle,
        on_delete=models.PROTECT
    )
    secondary_muscles = models.ManyToManyField(
        Muscle,
        related_name="secondary_muscles",
        blank=True
    )
    equipment = models.ManyToManyField(
        Equipment,
        blank=True
    )

    objects = ExerciseQuerySet.as_manager()

    def __str__(self):
        return self.name_es

    @property
    def is_custom(self):
        return self.owner_id is not None

    class Meta:
        ordering = ["name_es", "id"]