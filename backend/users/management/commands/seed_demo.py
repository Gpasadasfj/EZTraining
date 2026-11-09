import random
from datetime import timedelta
from decimal import Decimal
from typing import NamedTuple

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from exercises.models import Exercise
from routines.models import Routine, RoutineDay, RoutineExercise
from users.models import User, WeightLog
from workouts.models import Workout, WorkoutExercise, WorkoutSet

DEMO_USERNAME = "demo"


class PlannedExercise(NamedTuple):
    name: str  # nombre exacto en el catálogo
    start_weight: float  # kg en la primera semana
    sets: int
    min_reps: int
    max_reps: int
    rest: int  # segundos


PLAN = [
    ("Push", [
        PlannedExercise("Press de Banca", 60, 4, 6, 10, 150),
        PlannedExercise("Press militar con barra", 35, 3, 8, 10, 120),
        PlannedExercise("Press de banca inclinado con mancuernas", 22, 3, 8, 12, 90),
        PlannedExercise("Elevación lateral con mancuernas", 8, 3, 12, 15, 60),
        PlannedExercise("Extensión de tríceps en polea (barra en V)", 25, 3, 10, 12, 60),
    ]),
    ("Pull", [
        PlannedExercise("Jalón en polea", 50, 4, 8, 12, 120),
        PlannedExercise("Remo Inclinado con Barra (agarre prono)", 50, 3, 8, 10, 120),
        PlannedExercise("Elevación lateral posterior con mancuernas", 8, 3, 12, 15, 60),
        PlannedExercise("Curl de bíceps con barra", 25, 3, 8, 12, 60),
        PlannedExercise("Curl Martillo", 12, 3, 10, 12, 60),
    ]),
    ("Legs", [
        PlannedExercise("Sentadilla profunda con barra", 70, 4, 6, 8, 180),
        PlannedExercise("Peso muerto rumano con barra", 60, 3, 8, 10, 150),
        PlannedExercise("Prensa de piernas", 120, 3, 10, 12, 120),
        PlannedExercise("Curl femoral", 35, 3, 10, 12, 90),
        PlannedExercise("Elevación de talón de pie", 40, 3, 12, 15, 60),
    ]),
]

# Días atrás de cada entreno, del más antiguo al más reciente: 4 semanas, 3 por semana
WORKOUT_DAYS_AGO = [28, 26, 24, 21, 19, 17, 14, 12, 10, 7, 5, 2]

# Un registro de peso por semana, del más antiguo al más reciente
WEIGHTS = [84.6, 84.1, 83.9, 83.2, 83.4, 82.7, 82.3]


def round_weight(value):
    # Discos de 2,5 kg en barra y máquina; de 1 en 1 kg en mancuernas ligeras
    step = 2.5 if value >= 20 else 1
    return Decimal(str(round(value / step) * step))


class Command(BaseCommand):
    help = "Crea (o reinicia) el usuario de prueba «demo» con 4 semanas de datos de ejemplo."

    def handle(self, *args, **options):
        # Semilla fija: cada ejecución genera exactamente los mismos datos
        self.rng = random.Random(42)

        # Todo o nada: si algo falla (por ejemplo, falta un ejercicio), no queda nada a medias
        with transaction.atomic():
            user = self.get_demo_user()
            self.reset(user)
            routine, days = self.create_routine(user)
            self.create_workouts(user, routine, days)
            self.create_weight_logs(user)

        self.stdout.write(self.style.SUCCESS(
            f"Usuario «{DEMO_USERNAME}» listo: 1 rutina, {len(WORKOUT_DAYS_AGO)} entrenos y {len(WEIGHTS)} registros de peso."
        ))
        if not user.has_usable_password():
            self.stdout.write(self.style.WARNING(
                f"No tiene contraseña. Pónsela con: python manage.py changepassword {DEMO_USERNAME}"
            ))

    def get_demo_user(self):
        user, created = User.objects.get_or_create(
            username=DEMO_USERNAME,
            defaults={"email": "demo@example.com", "first_name": "Alex", "last_name": "Demo"},
        )
        if created:
            # Sin contraseña en el código: se pone después con changepassword
            user.set_unusable_password()
        user.height = Decimal("1.78")
        user.target_weight = Decimal("78.00")
        user.save()
        return user

    def reset(self, user):
        # Vuelve al estado inicial aunque alguien haya cambiado los datos de prueba
        for exercise in Exercise.objects.filter(owner=user):
            if exercise.image:
                exercise.image.delete(save=False)
        Exercise.objects.filter(owner=user).delete()
        Workout.objects.filter(user=user).delete()
        Routine.objects.filter(user=user).delete()
        WeightLog.objects.filter(user=user).delete()
        if user.avatar:
            user.avatar.delete(save=False)
            user.save(update_fields=["avatar"])

    def create_routine(self, user):
        routine = Routine.objects.create(
            user=user,
            name="Push Pull Legs",
            description="Empuje, tirón y pierna: tres días por semana.",
        )
        days = []
        for day_order, (day_name, planned) in enumerate(PLAN, start=1):
            day = RoutineDay.objects.create(routine=routine, name=day_name, order=day_order)
            entries = []
            for order, item in enumerate(planned, start=1):
                try:
                    exercise = Exercise.objects.get(owner__isnull=True, name_es=item.name)
                except Exercise.DoesNotExist:
                    raise CommandError(f"No hay ningún ejercicio en el catálogo llamado «{item.name}».")
                routine_exercise = RoutineExercise.objects.create(
                    routine_day=day,
                    exercise=exercise,
                    order=order,
                    target_sets=item.sets,
                    min_reps=item.min_reps,
                    max_reps=item.max_reps,
                    target_rir=2,
                    rest_time=item.rest,
                )
                entries.append((routine_exercise, item))
            days.append((day, entries))
        return routine, days

    def create_workouts(self, user, routine, days):
        now = timezone.localtime()
        for index, days_ago in enumerate(WORKOUT_DAYS_AGO):
            day, entries = days[index % len(days)]
            week = index // len(days)  # cada semana sube un poco el peso
            started = (now - timedelta(days=days_ago)).replace(hour=18, minute=30, second=0, microsecond=0)
            duration = timedelta(minutes=self.rng.randint(48, 66))

            workout = Workout.objects.create(
                user=user,
                routine_day=day,
                routine_name=routine.name,
                routine_day_name=day.name,
                finished_at=started + duration,
                duration=duration,
                completed=True,
            )
            # started_at es auto_now_add: al crear siempre pone "ahora", así que se cambia después
            Workout.objects.filter(pk=workout.pk).update(started_at=started, created_at=started)

            sets = []
            for order, (routine_exercise, item) in enumerate(entries, start=1):
                workout_exercise = WorkoutExercise.objects.create(
                    workout=workout,
                    exercise=routine_exercise.exercise,
                    exercise_name=routine_exercise.exercise.name_es,
                    order=order,
                    target_sets=routine_exercise.target_sets,
                    min_reps=routine_exercise.min_reps,
                    max_reps=routine_exercise.max_reps,
                    target_rir=routine_exercise.target_rir,
                    rest_time=routine_exercise.rest_time,
                )
                weight = round_weight(item.start_weight * (1 + 0.025 * week))
                for set_number in range(1, item.sets + 1):
                    sets.append(WorkoutSet(
                        workout_exercise=workout_exercise,
                        set_number=set_number,
                        weight=weight,
                        reps=Decimal(self.rng.randint(item.min_reps, item.max_reps)),
                        rir=self.rng.randint(1, 3),
                        completed=True,
                    ))
            WorkoutSet.objects.bulk_create(sets)

    def create_weight_logs(self, user):
        now = timezone.now()
        for index, weight in enumerate(WEIGHTS):
            days_ago = 7 * (len(WEIGHTS) - 1 - index) + 1
            log = WeightLog.objects.create(user=user, weight=Decimal(str(weight)))
            # recorded_at también es auto_now_add
            WeightLog.objects.filter(pk=log.pk).update(recorded_at=now - timedelta(days=days_ago))
        user.current_weight = Decimal(str(WEIGHTS[-1]))
        user.save(update_fields=["current_weight"])