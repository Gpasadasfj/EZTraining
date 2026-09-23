import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import workoutsRequest, {
  finishWorkoutRequest,
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

export function useWorkoutsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkoutPayload) => {
      const res = await workoutsCreateRequest(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}
