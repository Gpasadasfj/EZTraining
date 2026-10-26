import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createExerciseRequest,
  equipmentRequest,
  exerciseDetailRequest,
  exercisesRequest,
  musclesRequest,
  searchExercisesRequest,
} from "../api/exercises";
import type {
  CreateExercisePayload,
  ExerciseFilters,
} from "../types/exercises";

export function useExercisesInfinite(filters: ExerciseFilters) {
  return useInfiniteQuery({
    queryKey: ["exercises", filters],
    queryFn: async ({ pageParam }) => {
      const res = await exercisesRequest(pageParam, filters);
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