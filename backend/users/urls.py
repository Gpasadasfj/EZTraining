from django.urls import path

from .views import LogoutView, MeView, RegisterView, WeightLogDeleteView, WeightLogView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("weight-logs/", WeightLogView.as_view(), name="weightlog"),
    path("weight-logs/<int:pk>/", WeightLogDeleteView.as_view(), name="weightlog-delete"),
]