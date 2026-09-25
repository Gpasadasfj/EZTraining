import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { equipmentRequest, exercisesRequest, musclesRequest, searchExercisesRequest } from "../api/exercises";
import type { ExerciseFilters } from "../types/exercises";

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