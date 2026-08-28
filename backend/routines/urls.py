from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import RoutineDayViewSet, RoutineExerciseViewSet, RoutineViewSet

router = DefaultRouter()
router.register("", RoutineViewSet, basename="routine")

days_router = routers.NestedSimpleRouter(router, "", lookup="routine")
days_router.register("days", RoutineDayViewSet, basename="routine_day")

exercise_router = routers.NestedSimpleRouter(days_router, "days", lookup="routine_day")
exercise_router.register("exercises", RoutineExerciseViewSet, basename="days_exercise")


urlpatterns = router.urls + days_router.urls + exercise_router.urls