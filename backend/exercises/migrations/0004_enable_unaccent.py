from django.contrib.postgres.operations import UnaccentExtension
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0003_alter_exercise_equipment_and_more'),
    ]

    operations = [
        UnaccentExtension()
    ]
