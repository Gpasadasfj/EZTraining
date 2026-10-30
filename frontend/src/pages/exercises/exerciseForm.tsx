import React, { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { isAxiosError } from "axios";
import { ChevronLeft } from "lucide-react";
import ChipFieldset from "../../components/exercises/chipFieldset";
import DeleteExerciseSection from "../../components/exercises/deleteExerciseSection";
import ExercisePhotoField from "../../components/exercises/exercisePhotoField";
import StepsField from "../../components/exercises/stepsField";
import { cardClass, fieldClass } from "../../components/exercises/formStyles";
import useImagePicker from "../../hooks/useImagePicker";
import useSaveExercise from "../../hooks/useSaveExercise";
import {
  useEquipment,
  useExerciseDetail,
  useMuscles,
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
  // Si al crear se guardaron los datos pero falló la foto, se llega aquí en modo editar con este aviso
  const [photoFailed, setPhotoFailed] = useState(
    Boolean(location.state?.photoFailed),
  );

  const photo = useImagePicker(exercise?.image ?? null);
  const { data: muscles } = useMuscles();
  const { data: equipment } = useEquipment();
  const { saveExercise, isSaving, error } = useSaveExercise(exercise);

  // El backend responde 400 con { name: ["Ya tienes un ejercicio con ese nombre."] }
  const nameError = isAxiosError<{ name?: string[] }>(error)
    ? error.response?.data?.name?.[0]
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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const muscle = values.muscle;
    if (!canSubmit || muscle === null) return;

    const result = await saveExercise(
      {
        name: capitalize(values.name.trim()),
        muscle,
        secondary_muscles: values.secondaryMuscles,
        equipment: values.equipment,
        // Los pasos vacíos no se guardan
        instructions: values.steps.map((step) => step.trim()).filter(Boolean),
      },
      photo,
    );

    if (result.status === "error") return;

    if (result.status === "photoFailed") {
      // Al crear, se pasa a editar el ejercicio ya guardado: volver a pulsar "Crear"
      // daría "Ya tienes un ejercicio con ese nombre"
      if (exercise) setPhotoFailed(true);
      else
        navigate(`/exercises/${result.exercise.slug}/edit`, {
          replace: true,
          state: { photoFailed: true },
        });
      return;
    }

    navigate(BACK_TO);
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-32">
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

      <form onSubmit={handleSubmit} className="grid gap-4">
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

        <ExercisePhotoField
          photo={photo}
          uploadFailed={photoFailed}
          onPick={(e) => {
            setPhotoFailed(false);
            photo.pick(e);
          }}
        />

        <ChipFieldset
          legend="Músculo principal"
          options={muscles}
          isSelected={(id) => values.muscle === id}
          onToggle={pickMuscle}
        />

        <ChipFieldset
          legend="Músculos secundarios"
          optional
          options={muscles}
          isSelected={(id) => values.secondaryMuscles.includes(id)}
          isDisabled={(id) => values.muscle === id}
          onToggle={(id) =>
            setValues((prev) => ({
              ...prev,
              secondaryMuscles: toggle(prev.secondaryMuscles, id),
            }))
          }
        />

        <ChipFieldset
          legend="Material"
          optional
          options={equipment}
          isSelected={(id) => values.equipment.includes(id)}
          onToggle={(id) =>
            setValues((prev) => ({
              ...prev,
              equipment: toggle(prev.equipment, id),
            }))
          }
        />

        <StepsField
          steps={values.steps}
          onChange={(steps) => setValues((prev) => ({ ...prev, steps }))}
        />

        {error && !nameError && (
          <p
            role="alert"
            className="rounded-button border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
          >
            No se pudo guardar el ejercicio. Inténtalo de nuevo.
          </p>
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

      {/* Fuera del <form>: los botones del diálogo no deben poder enviar el formulario */}
      {exercise && (
        <DeleteExerciseSection
          exercise={exercise}
          onDeleted={() => navigate(BACK_TO)}
        />
      )}
    </div>
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
