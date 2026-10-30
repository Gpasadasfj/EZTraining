import {
  useCreateExercise,
  useRemoveExerciseImage,
  useUpdateExercise,
  useUploadExerciseImage,
} from "./useExercises";
import type { CreateExercisePayload, Exercise } from "../types/exercises";

interface PhotoChange {
  file: File | null;
  removed: boolean;
}

type SaveResult =
  | { status: "saved"; exercise: Exercise }
  | { status: "photoFailed"; exercise: Exercise }
  | { status: "error" };

// Guarda en dos pasos: primero los datos (JSON) y después la foto (multipart)
export default function useSaveExercise(exercise?: Exercise) {
  const create = useCreateExercise();
  const update = useUpdateExercise();
  const uploadImage = useUploadExerciseImage();
  const removeImage = useRemoveExerciseImage();
  const save = exercise ? update : create;

  const saveExercise = async (payload: CreateExercisePayload, photo: PhotoChange): Promise<SaveResult> => {
    let saved: Exercise;
    try {
      saved = exercise
        ? await update.mutateAsync({ slug: exercise.slug, data: payload })
        : await create.mutateAsync(payload);
    } catch {
      // El detalle del error queda en save.error
      return { status: "error" };
    }

    try {
      if (photo.file) await uploadImage.mutateAsync({ slug: saved.slug, file: photo.file });
      else if (photo.removed && exercise?.image) await removeImage.mutateAsync(saved.slug);
    } catch {
      return { status: "photoFailed", exercise: saved };
    }

    return { status: "saved", exercise: saved };
  };

  return {
    saveExercise,
    isSaving: save.isPending || uploadImage.isPending || removeImage.isPending,
    error: save.error,
  };
}