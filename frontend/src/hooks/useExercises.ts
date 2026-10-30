import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createExerciseRequest,
  deleteExerciseRequest,
  equipmentRequest,
  exerciseDetailRequest,
  exercisesRequest,
  musclesRequest,
  removeExerciseImageRequest,
  searchExercisesRequest,
  updateExerciseRequest,
  uploadExerciseImageRequest,
} from "../api/exercises";
import type {
  CreateExercisePayload,
  ExerciseFilters,
  UpdateExerciseVariables,
} from "../types/exercises";

export function useExercisesInfinite(filters: ExerciseFilters, search = "") {
  return useInfiniteQuery({
    queryKey: ["exercises", filters, search],
    queryFn: async ({ pageParam }) => {
      const res = await exercisesRequest(pageParam, filters, search);
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next,
  });
}

// null: no se pide nada (ficha cerrada)
export function useExerciseDetail(slug: string | null) {
  return useQuery({
    queryKey: ["exercises", "detail", slug],
    queryFn: async () => {
      const res = await exerciseDetailRequest(slug as string);
      return res.data;
    },
    enabled: slug !== null,
  });
}

export function useSearchExercises(search: string, filters: ExerciseFilters) {
  const hasFilters =
    filters.muscle !== null ||
    filters.secondaryMuscles.length > 0 ||
    filters.equipment.length > 0;

  return useQuery({
    queryKey: ["exercises", "search", search, filters],
    queryFn: async () => {
      const res = await searchExercisesRequest(search, filters);
      return res.data;
    },
    enabled: search.length >= 2 || hasFilters,
  });
}

export function useMuscles() {
  return useQuery({
    queryKey: ["muscles"],
    queryFn: async () => {
      const res = await musclesRequest();
      return res.data;
    },
    staleTime: Infinity,
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const res = await equipmentRequest();
      return res.data;
    },
    staleTime: Infinity,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExercisePayload) => {
      const res = await createExerciseRequest(data);
      return res.data;
    },
    // Con return, la mutación no termina hasta que se refrescan las listas.
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: UpdateExerciseVariables) => {
      const res = await updateExerciseRequest(slug, data);
      return res.data;
    },
    onSuccess: (exercise) => {
      // La respuesta ya es el ejercicio actualizado: la ficha lo muestra sin pedirlo otra vez
      queryClient.setQueryData(["exercises", "detail", exercise.slug], exercise);
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      // Los días de rutina muestran el nombre del ejercicio
      queryClient.invalidateQueries({ queryKey: ["routineExercise"] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deleteExerciseRequest(slug),
    onSuccess: (_response, slug) => {
      // Primero se quita su detalle; si no, invalidar "exercises" lo volvería a pedir (404)
      queryClient.removeQueries({ queryKey: ["exercises", "detail", slug] });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      // Se ha quitado de las rutinas: cambian sus días, sus contadores y el entreno que toca
      queryClient.invalidateQueries({ queryKey: ["routineExercise"] });
      queryClient.invalidateQueries({ queryKey: ["routine"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUploadExerciseImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, file }: { slug: string; file: File }) => {
      const res = await uploadExerciseImageRequest(slug, file);
      return res.data;
    },
    onSuccess: (exercise) => {
      queryClient.setQueryData(["exercises", "detail", exercise.slug], exercise);
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useRemoveExerciseImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const res = await removeExerciseImageRequest(slug);
      return res.data;
    },
    onSuccess: (exercise) => {
      queryClient.setQueryData(["exercises", "detail", exercise.slug], exercise);
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}