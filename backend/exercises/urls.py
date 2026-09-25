from django.urls import path

from exercises.views import EquipmentListView, ExerciseDetailView, ExerciseListView, MuscleListView

urlpatterns = [
    path("", ExerciseListView.as_view(), name="exercises-list"),
    path("muscles/", MuscleListView.as_view()),
    path("equipment/", EquipmentListView.as_view()),
    path("<slug:slug>/", ExerciseDetailView.as_view(), name="exercise-detail"),
]