from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Permite acceder al objeto únicamente a su propietario.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user