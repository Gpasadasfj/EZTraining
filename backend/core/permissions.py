from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Permite acceder al objeto únicamente a su propietario.
    """
    owner_path = "user"  # por defecto, el caso simple (WeightLog, Routine)

    def has_object_permission(self, request, view, obj):
        owner = obj
        for attr in self.owner_path.split("."):
            owner = getattr(owner, attr)
        return owner == request.user