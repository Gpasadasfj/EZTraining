from django.contrib import admin
from django.urls import include, path 
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

import debug_toolbar

from django.conf import settings


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/dashboard/', include("dashboard.urls")),
    path('api/users/', include("users.urls")),
    path('api/exercises/', include("exercises.urls")),
    path('api/routines/', include("routines.urls")),
    path('api/workouts/', include("workouts.urls")),
]

if settings.DEBUG:
    urlpatterns += [
        path("api-auth/", include("rest_framework.urls")),
        path('__debug__/', include(debug_toolbar.urls)),
    ]