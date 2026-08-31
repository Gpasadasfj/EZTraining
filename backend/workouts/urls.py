from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from workouts.views import WorkoutExerciseViewSet, WorkoutSetViewSet, WorkoutViewSet

router = DefaultRouter()
router.register("", WorkoutViewSet, basename="workout")

workout_exercise_router = routers.NestedSimpleRouter(router, "", lookup="workout")
workout_exercise_router.register("exercises", WorkoutExerciseViewSet, basename="workout-exercise")

workout_set = routers.NestedSimpleRouter(workout_exercise_router, "exercises", lookup="workout_exercise")
workout_set.register("sets", WorkoutSetViewSet, basename="workout-set")

urlpatterns = router.urls + workout_exercise_router.urls + workout_set.urls