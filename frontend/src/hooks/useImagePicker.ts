import { useEffect, useState, type ChangeEvent } from "react";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_SIZE = 10 * 1024 * 1024; // el mismo límite que el backend

// Los tipos y también las extensiones: algunos navegadores no reconocen el tipo de un .heic
export const IMAGE_ACCEPT = [...ACCEPTED_TYPES, ".heic", ".heif"].join(",");

export function validateImage(file: File): string | null {
  // Si el navegador no sabe qué tipo es (file.type vacío), se mira la extensión
  const isHeic = /\.(heic|heif)$/i.test(file.name);
  if (!ACCEPTED_TYPES.includes(file.type) && !isHeic) {
    return "Solo se admiten imágenes JPG, PNG, WebP o HEIC (fotos de iPhone).";
  }
  if (file.size > MAX_SIZE) return "La imagen no puede pesar más de 10 MB.";
  return null;
}

// initialUrl: la foto que ya está guardada (o null si no hay)
export default function useImagePicker(initialUrl: string | null = null) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Las vistas previas locales (blob:) ocupan memoria hasta que se liberan.
  // El cleanup recibe la vista previa anterior cada vez que cambia
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    // Vacía el input para poder volver a elegir el mismo archivo
    event.target.value = "";
    if (!next) return;

    const invalid = validateImage(next);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError(null);
    setFile(next);
    setRemoved(false);
    setPreview(URL.createObjectURL(next));
  };

  const remove = () => {
    setFile(null);
    setRemoved(true);
    setPreview(null);
    setError(null);
  };

  return { file, preview, removed, error, pick, remove };
}

export type ImagePicker = ReturnType<typeof useImagePicker>;
