from django.urls import path

from .views import AvatarView, LogoutView, MeView, RegisterView, WeightLogDeleteView, WeightLogView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("me/avatar/", AvatarView.as_view(), name="me-avatar"),
    path("weight-logs/", WeightLogView.as_view(), name="weight-logs"),
    path("weight-logs/<int:pk>/", WeightLogDeleteView.as_view(), name="weightlog-delete"),
]