from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """
    Lectura: ejercicios del catálogo (sin dueño) o propios.
    Escritura (editar/borrar): solo ejercicios propios.

    La vista ya filtra con Exercise.objects.visible_to(user); este permiso
    repite la comprobación para que siga siendo seguro aunque se reutilice
    en una vista con otro queryset.
    """

    message = "Solo puedes modificar tus propios ejercicios."

    def has_object_permission(self, request, view, obj):
        is_owner = obj.owner_id is not None and obj.owner_id == request.user.id

        if request.method in SAFE_METHODS:
            return obj.owner_id is None or is_owner

        return is_owner