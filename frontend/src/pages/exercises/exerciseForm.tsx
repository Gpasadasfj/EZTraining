import React, { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { isAxiosError } from "axios";
import { Camera, ChevronLeft, Plus, Trash2, Upload, X } from "lucide-react";
import OptionChip from "../../components/exercises/optionChip";
import ConfirmDialog from "../../components/ui/confirmDialog";
import useImagePicker, { IMAGE_ACCEPT } from "../../hooks/useImagePicker";
import {
  useCreateExercise,
  useDeleteExercise,
  useEquipment,
  useExerciseDetail,
  useMuscles,
  useRemoveExerciseImage,
  useUpdateExercise,
  useUploadExerciseImage,
} from "../../hooks/useExercises";
import type { Exercise } from "../../types/exercises";
import { getSteps } from "../../utils/exercise";
import { capitalize } from "../../utils/format";

interface FormValues {
  name: string;
  muscle: number | null;
  secondaryMuscles: number[];
  equipment: number[];
  steps: string[];
}

interface ExerciseFormProps {
  exercise?: Exercise; // sin ejercicio: modo "nuevo"
  initial: FormValues;
}

const BACK_TO = "/exercises?tab=mine";

const cardClass = "grid gap-3 rounded-card border border-line bg-surface p-4";
const fieldClass =
  "w-full rounded-button border border-line-strong bg-canvas px-3.5 text-base placeholder:text-fg-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

const toggle = (list: number[], id: number) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

const toValues = (exercise: Exercise): FormValues => {
  const steps = getSteps(exercise.instructions_es);
  return {
    name: exercise.name_es,
    muscle: exercise.muscle_id,
    secondaryMuscles: exercise.secondary_muscle_ids,
    equipment: exercise.equipment_ids,
    steps: steps.length > 0 ? steps : [""],
  };
};

function ExerciseForm({ exercise, initial }: ExerciseFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState(initial);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // Si al crear se guardaron los datos pero falló la foto, se llega aquí en modo editar con este aviso
  const [photoFailed, setPhotoFailed] = useState(
    Boolean(location.state?.photoFailed),
  );

  const photo = useImagePicker(exercise?.image ?? null);
  const { data: muscles } = useMuscles();
  const { data: equipment } = useEquipment();
  const create = useCreateExercise();
  const update = useUpdateExercise();
  const remove = useDeleteExercise();
  const uploadImage = useUploadExerciseImage();
  const removeImage = useRemoveExerciseImage();

  const save = exercise ? update : create;
  const isSaving =
    save.isPending || uploadImage.isPending || removeImage.isPending;
  // El backend responde 400 con { name: ["Ya tienes un ejercicio con ese nombre."] }
  const nameError = isAxiosError<{ name?: string[] }>(save.error)
    ? save.error.response?.data?.name?.[0]
    : undefined;
  const canSubmit =
    values.name.trim().length > 0 && values.muscle !== null && !isSaving;

  const pickMuscle = (id: number) => {
    setValues((prev) => ({
      ...prev,
      muscle: id,
      // Un músculo no puede ser principal y secundario a la vez
      secondaryMuscles: prev.secondaryMuscles.filter((item) => item !== id),
    }));
  };

  const setStep = (index: number, text: string) => {
    setValues((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? text : step)),
    }));
  };

  const removeStep = (index: number) => {
    setValues((prev) => {
      const steps = prev.steps.filter((_, i) => i !== index);
      // Siempre queda al menos un hueco para escribir
      return { ...prev, steps: steps.length > 0 ? steps : [""] };
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const muscle = values.muscle;
    if (!canSubmit || muscle === null) return;

    const payload = {
      name: capitalize(values.name.trim()),
      muscle,
      secondary_muscles: values.secondaryMuscles,
      equipment: values.equipment,
      // Los pasos vacíos no se guardan
      instructions: values.steps.map((step) => step.trim()).filter(Boolean),
    };

    // 1. Los datos. Si fallan, el error lo muestra save.error y no se sigue
    let saved: Exercise;
    try {
      saved = exercise
        ? await update.mutateAsync({ slug: exercise.slug, data: payload })
        : await create.mutateAsync(payload);
    } catch {
      return;
    }

    // 2. La foto, solo si ha cambiado
    try {
      if (photo.file)
        await uploadImage.mutateAsync({ slug: saved.slug, file: photo.file });
      else if (photo.removed && exercise?.image)
        await removeImage.mutateAsync(saved.slug);
    } catch {
      // El ejercicio ya está guardado: al crear, se pasa a editarlo para reintentar la foto
      // (volver a pulsar "Crear" daría "Ya tienes un ejercicio con ese nombre")
      if (!exercise)
        navigate(`/exercises/${saved.slug}/edit`, {
          replace: true,
          state: { photoFailed: true },
        });
      else setPhotoFailed(true);
      return;
    }

    navigate(BACK_TO);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-2xl gap-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-32"
      >
        <header className="grid gap-1.5">
          <Link
            to={BACK_TO}
            className="-ml-1.5 inline-flex items-center gap-1 justify-self-start rounded-lg px-1.5 py-1 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <ChevronLeft className="size-4.5" aria-hidden="true" />
            Ejercicios
          </Link>
          <h1 className="font-display text-4xl leading-none font-bold italic uppercase lg:text-5xl">
            {exercise ? "Editar ejercicio" : "Nuevo ejercicio"}
          </h1>
        </header>

        {photoFailed && (
          <p
            role="alert"
            className="rounded-button border border-amber-400/30 bg-amber-400/10 px-3.5 py-3 text-sm text-amber-200"
          >
            El ejercicio se ha guardado, pero la foto no se pudo subir. Elígela
            de nuevo y pulsa «Guardar cambios».
          </p>
        )}

        <section className={cardClass}>
          <label htmlFor="exercise-name" className="font-semibold">
            Nombre
          </label>
          <input
            id="exercise-name"
            type="text"
            value={values.name}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Ej.: Press Arnold sentado"
            autoComplete="off"
            aria-invalid={Boolean(nameError)}
            className={`${fieldClass} h-12`}
          />
          {nameError && <p className="text-sm text-red-400">{nameError}</p>}
        </section>

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
            onChange={(e) => {
              setPhotoFailed(false);
              photo.pick(e);
            }}
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
              className="grid cursor-pointer justify-items-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-line-strong bg-canvas px-3 py-6 text-center font-semibold text-fg-muted transition-colors hover:border-primary hover:text-fg"
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
        </section>

        <fieldset className={cardClass}>
          <legend className="sr-only">Músculo principal</legend>
          <p aria-hidden="true" className="font-semibold">
            Músculo principal
          </p>
          <div className="flex flex-wrap gap-1.5">
            {muscles?.map((muscle) => (
              <OptionChip
                key={muscle.id}
                selected={values.muscle === muscle.id}
                onClick={() => pickMuscle(muscle.id)}
              >
                {muscle.name}
              </OptionChip>
            ))}
          </div>
        </fieldset>

        <fieldset className={cardClass}>
          <legend className="sr-only">Músculos secundarios (opcional)</legend>
          <p aria-hidden="true" className="font-semibold">
            Músculos secundarios{" "}
            <span className="ml-1 text-sm font-medium text-fg-subtle">
              Opcional
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {muscles?.map((muscle) => (
              <OptionChip
                key={muscle.id}
                selected={values.secondaryMuscles.includes(muscle.id)}
                disabled={values.muscle === muscle.id}
                onClick={() =>
                  setValues((prev) => ({
                    ...prev,
                    secondaryMuscles: toggle(prev.secondaryMuscles, muscle.id),
                  }))
                }
              >
                {muscle.name}
              </OptionChip>
            ))}
          </div>
        </fieldset>

        <fieldset className={cardClass}>
          <legend className="sr-only">Material (opcional)</legend>
          <p aria-hidden="true" className="font-semibold">
            Material{" "}
            <span className="ml-1 text-sm font-medium text-fg-subtle">
              Opcional
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {equipment?.map((item) => (
              <OptionChip
                key={item.id}
                selected={values.equipment.includes(item.id)}
                onClick={() =>
                  setValues((prev) => ({
                    ...prev,
                    equipment: toggle(prev.equipment, item.id),
                  }))
                }
              >
                {item.name}
              </OptionChip>
            ))}
          </div>
        </fieldset>

        <section className={cardClass} aria-labelledby="steps-title">
          <div className="grid gap-0.5">
            <h2 id="steps-title" className="font-semibold">
              Cómo se hace{" "}
              <span className="ml-1 text-sm font-medium text-fg-subtle">
                Opcional
              </span>
            </h2>
            <p className="text-sm text-fg-subtle">
              Un paso en cada hueco. Saldrán numerados en la ficha.
            </p>
          </div>

          <ol className="grid gap-2">
            {values.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-2.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-accent tabular-nums">
                  {index + 1}
                </span>
                <textarea
                  value={step}
                  onChange={(e) => setStep(index, e.target.value)}
                  rows={1}
                  placeholder={`Describe el paso ${index + 1}`}
                  aria-label={`Paso ${index + 1}`}
                  className={`${fieldClass} field-sizing-content min-h-12 resize-none py-3 leading-snug`}
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  aria-label={`Quitar paso ${index + 1}`}
                  className="mt-1.5 grid size-9 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
                >
                  <X className="size-4.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() =>
              setValues((prev) => ({ ...prev, steps: [...prev.steps, ""] }))
            }
            className="inline-flex h-10 items-center gap-1.5 justify-self-start rounded-lg px-3 font-semibold text-accent transition-colors hover:bg-primary-soft"
          >
            <Plus className="size-4.5" aria-hidden="true" />
            Añadir paso
          </button>
        </section>

        {save.isError && !nameError && (
          <p
            role="alert"
            className="rounded-button border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
          >
            No se pudo guardar el ejercicio. Inténtalo de nuevo.
          </p>
        )}

        {exercise && (
          <div className="flex items-center justify-between gap-3 rounded-card border border-red-500/25 p-4">
            <p className="text-sm text-fg-muted">
              <span className="block font-semibold text-fg">
                Borrar ejercicio
              </span>
              Se quitará de tus rutinas. Tus entrenos pasados lo conservarán.
            </p>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-button bg-red-500/10 px-3.5 font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Borrar
            </button>
          </div>
        )}

        {/* Barra fija: abajo en móvil, flotante a la derecha en escritorio */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/90 px-4 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-90 lg:rounded-2xl lg:border lg:border-line-strong lg:p-3 lg:shadow-2xl">
          <div className="mx-auto flex max-w-2xl gap-2">
            <Link
              to={BACK_TO}
              className="grid h-12 flex-1 place-items-center rounded-button bg-surface-hover font-semibold transition-colors hover:bg-line-strong"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-12 flex-2 rounded-button bg-primary font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSaving
                ? "Guardando…"
                : exercise
                  ? "Guardar cambios"
                  : "Crear ejercicio"}
            </button>
          </div>
        </div>
      </form>

      {exercise && (
        <ConfirmDialog
          open={isDeleteOpen}
          title={`¿Borrar «${exercise.name_es}»?`}
          confirmLabel="Borrar"
          cancelLabel="Cancelar"
          tone="danger"
          isPending={remove.isPending}
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={() =>
            remove.mutate(exercise.slug, { onSuccess: () => navigate(BACK_TO) })
          }
        >
          Se quitará de las rutinas que lo usen. Tus entrenos pasados lo
          seguirán mostrando.
          {remove.isError && (
            <span role="alert" className="mt-2 block text-red-400">
              No se pudo borrar. Inténtalo de nuevo.
            </span>
          )}
        </ConfirmDialog>
      )}
    </>
  );
}

export default function ExerciseFormPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const {
    data: exercise,
    isLoading,
    isError,
  } = useExerciseDetail(slug ?? null);

  if (!slug) {
    return (
      <ExerciseForm
        initial={{
          // Viene de «Crear «x»» en la búsqueda
          name: searchParams.get("name") ?? "",
          muscle: null,
          secondaryMuscles: [],
          equipment: [],
          steps: [""],
        }}
      />
    );
  }

  if (isLoading) return <p className="text-fg-muted">Cargando ejercicio…</p>;
  if (isError || !exercise)
    return <p className="text-fg-muted">No se pudo cargar el ejercicio.</p>;
  if (!exercise.is_custom)
    return (
      <p className="text-fg-muted">
        Solo puedes editar los ejercicios que has creado tú.
      </p>
    );

  // key: si cambia el ejercicio, el formulario se monta de cero con sus datos
  return (
    <ExerciseForm
      key={exercise.slug}
      exercise={exercise}
      initial={toValues(exercise)}
    />
  );
}
