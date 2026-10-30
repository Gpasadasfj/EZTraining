import { useEffect, useState, type ChangeEvent } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // el mismo límite que el backend

export const IMAGE_ACCEPT = ACCEPTED_TYPES.join(",");

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

    if (!ACCEPTED_TYPES.includes(next.type)) {
      setError("Solo se admiten imágenes JPG, PNG o WebP.");
      return;
    }
    if (next.size > MAX_SIZE) {
      setError("La imagen no puede pesar más de 5 MB.");
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