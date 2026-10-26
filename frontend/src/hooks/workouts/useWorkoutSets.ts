import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import workoutSetsRequest, {
  updateWorkoutSetRequest,
  workoutSetDetailRequest,
} from "../../api/workouts/workoutSets";
import type { UpdateWorkoutSetVariables } from "../../types/workouts/workoutSets";

export default function useWorkoutSets(workoutId: number, exerciseId: number) {
  return useQuery({
    queryKey: ["workoutSet", workoutId, exerciseId],
    queryFn: async () => {
      const res = await workoutSetsRequest(workoutId, exerciseId);
      return res.data;
    },
    enabled: !Number.isNaN(workoutId) && !Number.isNaN(exerciseId),
  });
}

export function useWorkoutSetDetail(
  workoutId: number,
  exerciseId: number,
  setId: number,
) {
  return useQuery({
    queryKey: ["workoutSet", workoutId, exerciseId, setId],
    queryFn: async () => {
      const res = await workoutSetDetailRequest(workoutId, exerciseId, setId);
      return res.data;
    },
    enabled:
      !Number.isNaN(workoutId) &&
      !Number.isNaN(exerciseId) &&
      !Number.isNaN(setId),
  });
}

export function useUpdateWorkoutSet(workoutId: number, exerciseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, data }: UpdateWorkoutSetVariables) => {
      const res = await updateWorkoutSetRequest(
        workoutId,
        exerciseId,
        setId,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutSet", workoutId, exerciseId],
      });
      // El contador "3/17 series" del entreno activo cambia
      queryClient.invalidateQueries({ queryKey: ["workouts", "active"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}