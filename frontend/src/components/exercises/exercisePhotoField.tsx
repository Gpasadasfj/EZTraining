import type { ChangeEvent } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { IMAGE_ACCEPT, type ImagePicker } from "../../hooks/useImagePicker";
import { cardClass } from "./formStyles";

interface ExercisePhotoFieldProps {
  photo: ImagePicker;
  uploadFailed: boolean;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function ExercisePhotoField({
  photo,
  uploadFailed,
  onPick,
}: ExercisePhotoFieldProps) {
  return (
    <section className={cardClass} aria-labelledby="photo-title">
      <h2 id="photo-title" className="font-semibold">
        Foto{" "}
        <span className="ml-1 text-sm font-medium text-fg-subtle">
          Opcional
        </span>
      </h2>

      {/* El input real va oculto: los <label htmlFor> son los botones visibles */}
      <input
        id="exercise-photo"
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={onPick}
        className="sr-only"
      />

      {photo.preview ? (
        <div className="flex items-center gap-3.5">
          <img
            src={photo.preview}
            alt="Foto del ejercicio"
            className="size-28 shrink-0 rounded-xl object-cover lg:size-32"
          />
          <div className="grid flex-1 gap-2">
            <label
              htmlFor="exercise-photo"
              className="inline-flex h-10.5 cursor-pointer items-center justify-center gap-2 rounded-button bg-surface-hover font-semibold transition-colors hover:bg-line-strong"
            >
              <Upload className="size-4.5" aria-hidden="true" />
              Cambiar
            </label>
            <button
              type="button"
              onClick={photo.remove}
              className="inline-flex h-10.5 items-center justify-center gap-2 rounded-button bg-red-500/10 font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="size-4.5" aria-hidden="true" />
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="exercise-photo"
          className="grid cursor-pointer justify-items-center gap-1.5 rounded-xl border-2 border-dashed border-line-strong bg-canvas px-3 py-6 text-center font-semibold text-fg-muted transition-colors hover:border-primary hover:text-fg"
        >
          <Camera className="size-7 text-fg-subtle" aria-hidden="true" />
          Elegir foto
          <span className="text-sm font-medium text-fg-subtle">
            JPG, PNG o WebP · máximo 5 MB
          </span>
        </label>
      )}

      {photo.error && (
        <p role="alert" className="text-sm text-red-400">
          {photo.error}
        </p>
      )}
      {uploadFailed && (
        <p role="alert" className="text-sm text-amber-300">
          El ejercicio se ha guardado, pero la foto no se pudo subir. Inténtalo
          otra vez desde aquí.
        </p>
      )}
    </section>
  );
}
