import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import workoutExercisesRequest, {
  previousWorkoutExerciseRequest,
  updateWorkoutExerciseRequest,
  workoutExerciseDetailRequest,
} from "../../api/workouts/workoutExercises";
import type { UpdateWorkoutExerciseVariables } from "../../types/workouts/workoutExercises";

export default function useWorkoutExercises(workoutId: number) {
  return useQuery({
    queryKey: ["workoutExercise", workoutId],
    queryFn: async () => {
      const res = await workoutExercisesRequest(workoutId);
      return res.data;
    },
    enabled: !Number.isNaN(workoutId),
  });
}

export function useWorkoutExerciseDetail(workoutId: number, exerciseId: number) {
  return useQuery({
    queryKey: ["workoutExercise", workoutId, exerciseId],
    queryFn: async () => {
      const res = await workoutExerciseDetailRequest(workoutId, exerciseId);
      return res.data;
    },
    enabled: !Number.isNaN(workoutId) && !Number.isNaN(exerciseId),
  });
}

// Solo se pide al abrir "último entreno", y no cambia durante el entreno
export function usePreviousWorkoutExercise(
  workoutId: number,
  exerciseId: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["workoutExercise", workoutId, exerciseId, "previous"],
    queryFn: async () => {
      const res = await previousWorkoutExerciseRequest(workoutId, exerciseId);
      return res.data;
    },
    enabled: enabled && !Number.isNaN(workoutId) && !Number.isNaN(exerciseId),
    staleTime: Infinity,
  });
}

export function useUpdateWorkoutExercise(workoutId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ exerciseId, data }: UpdateWorkoutExerciseVariables) => {
      const res = await updateWorkoutExerciseRequest(workoutId, exerciseId, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutExercise"] });
    },
  });
}