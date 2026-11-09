import { useState, type ChangeEvent } from "react";
import { isAxiosError } from "axios";
import { Trash2, Upload } from "lucide-react";
import Avatar from "./avatar";
import Sheet from "../ui/sheet";
import { useRemoveAvatar, useUploadAvatar } from "../../hooks/me/useMe";
import { IMAGE_ACCEPT, validateImage } from "../../hooks/useImagePicker";
import type { User } from "../../types/users";

interface AvatarSheetProps {
  me: User;
  onClose: () => void;
}

// El backend responde 400 con { avatar: ["..."] } si la imagen no vale
const serverMessage = (error: unknown) =>
  (isAxiosError<{ avatar?: string[] }>(error) &&
    error.response?.data?.avatar?.[0]) ||
  "No se pudo guardar la foto. Inténtalo de nuevo.";

export default function AvatarSheet({ me, onClose }: AvatarSheetProps) {
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const [error, setError] = useState<string | null>(null);
  const isBusy = upload.isPending || remove.isPending;

  // Al elegir la foto se sube directamente: no hay un paso de "guardar"
  const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const invalid = validateImage(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError(null);
    upload.mutate(file, {
      onSuccess: onClose,
      onError: (err) => setError(serverMessage(err)),
    });
  };

  const handleRemove = () => {
    setError(null);
    remove.mutate(undefined, {
      onSuccess: onClose,
      onError: (err) => setError(serverMessage(err)),
    });
  };

  return (
    <Sheet title="Foto de perfil" onClose={onClose}>
      <Avatar
        user={me}
        className="size-32 justify-self-center font-display text-5xl font-extrabold italic"
      />
      <p className="text-center text-sm text-fg-subtle">
        JPG, PNG o WebP · máximo 10 MB. Se recorta en círculo.
      </p>

      {error && (
        <p role="alert" className="text-center text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid gap-2">
        <input
          id="avatar-file"
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handlePick}
          disabled={isBusy}
          className="sr-only"
        />
        <label
          htmlFor="avatar-file"
          aria-disabled={isBusy}
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-button bg-primary font-semibold text-on-primary transition-colors hover:bg-primary-hover aria-disabled:cursor-progress aria-disabled:opacity-60"
        >
          <Upload className="size-4.5" aria-hidden="true" />
          {upload.isPending
            ? "Subiendo…"
            : me.avatar
              ? "Cambiar foto"
              : "Elegir foto"}
        </label>
        {me.avatar && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isBusy}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-button bg-danger/10 font-semibold text-danger transition-colors hover:bg-danger/20 disabled:opacity-60"
          >
            <Trash2 className="size-4.5" aria-hidden="true" />
            {remove.isPending ? "Quitando…" : "Quitar foto"}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="h-12 rounded-button bg-surface-hover font-semibold transition-colors hover:bg-line-strong"
        >
          Cancelar
        </button>
      </div>
    </Sheet>
  );
}
