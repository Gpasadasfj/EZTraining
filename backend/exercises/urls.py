from django.urls import path

from exercises.views import ExerciseDetailView, ExerciseListView

urlpatterns = [
    path("", ExerciseListView.as_view(), name="exercises-list"),
    path("<slug:slug>/", ExerciseDetailView.as_view(), name="exercise-detail"),
]