from io import BytesIO
from uuid import uuid4

from django.core.files.base import ContentFile
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener
from rest_framework import serializers

# Las fotos del iPhone se guardan en HEIC. Esto enseña a Pillow a abrirlas, y como
# se registra al cargar el módulo, también vale para la validación de imágenes de DRF
register_heif_opener()

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "HEIF"}


def process_image(uploaded, max_side, square=False):
    """
    Valida la imagen y la deja lista para guardar: con la rotación del móvil
    corregida, reducida y en WebP. Así cada foto ocupa unos 50-100 KB.
    """
    if uploaded.size > MAX_UPLOAD_SIZE:
        raise serializers.ValidationError("La imagen no puede pesar más de 10 MB.")

    # DRF ya la ha leído para comprobar que es una imagen: hay que volver al principio
    uploaded.seek(0)
    image = Image.open(uploaded)
    if image.format not in ALLOWED_FORMATS:
        raise serializers.ValidationError("Solo se admiten imágenes JPG, PNG, WebP o HEIC.")

    # Las fotos de móvil guardan el giro en los metadatos EXIF, no en los píxeles
    image = ImageOps.exif_transpose(image)
    # WebP admite transparencia: se conserva si la imagen la tenía
    image = image.convert("RGBA" if image.mode in ("RGBA", "LA", "P") else "RGB")

    if square:
        image = ImageOps.fit(image, (max_side, max_side))  # recorta al centro
    else:
        image.thumbnail((max_side, max_side))  # reduce sin deformar

    buffer = BytesIO()
    image.save(buffer, format="WEBP", quality=82)
    # Nombre aleatorio: no revela el nombre original y evita que el navegador muestre la foto antigua
    return ContentFile(buffer.getvalue(), name=f"{uuid4().hex}.webp")


def replace_image(instance, field_name, new_file):
    """Guarda la imagen nueva y después borra el archivo de la anterior."""
    field = getattr(instance, field_name)
    old_name = field.name
    field.save(new_file.name, new_file, save=True)
    if old_name:
        field.storage.delete(old_name)


def remove_image(instance, field_name):
    """Borra el archivo y deja el campo vacío."""
    field = getattr(instance, field_name)
    if field:
        field.delete(save=True)