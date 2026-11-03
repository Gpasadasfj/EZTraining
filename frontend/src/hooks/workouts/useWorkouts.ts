import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import workoutsRequest, {
  activeWorkoutRequest,
  finishWorkoutRequest,
  workoutHistoryRequest,
  workoutSummaryRequest,
  workoutsCreateRequest,
  workoutsDetailRequest,
} from "../../api/workouts/workouts";
import type { CreateWorkoutPayload } from "../../types/workouts/workouts";

export default function useWorkouts() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const res = await workoutsRequest();
      return res.data;
    },
  });
}

export function useWorkoutsDetail(id: number) {
  return useQuery({
    queryKey: ["workouts", id],
    queryFn: async () => {
      const res = await workoutsDetailRequest(id);
      return res.data;
    },
    enabled: !Number.isNaN(id),
  });
}

// null si no hay entreno en curso
export function useActiveWorkout() {
  return useQuery({
    queryKey: ["workouts", "active"],
    queryFn: async () => {
      const res = await activeWorkoutRequest();
      return res.data;
    },
  });
}

export function useWorkoutSummary(id: number) {
  return useQuery({
    queryKey: ["workouts", id, "summary"],
    queryFn: async () => {
      const res = await workoutSummaryRequest(id);
      return res.data;
    },
    enabled: !Number.isNaN(id),
  });
}

export function useWorkoutsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkoutPayload) => {
      const res = await workoutsCreateRequest(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useFinishWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await finishWorkoutRequest(id);
      return res.data;
    },
    onSuccess: (workout) => {
      // La respuesta ya es el entreno terminado: la página pasa al resumen sin esperar
      queryClient.setQueryData(["workouts", workout.id], workout);
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useWorkoutHistory() {
  return useInfiniteQuery({
    // Empieza por ["workouts"]: useFinishWorkout ya lo invalida al terminar un entreno
    queryKey: ["workouts", "history"],
    queryFn: async ({ pageParam }) => {
      const res = await workoutHistoryRequest(pageParam);
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next,
  });
}
