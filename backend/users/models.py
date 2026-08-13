from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True)
    height = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
    )
    current_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )
    target_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

class WeightLog(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )
    recorded_at = models.DateTimeField(auto_now_add=True)