import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import routineExercisesRequest, {
  createRoutineExercisesRequest,
  deleteRoutineExercisesRequest,
  updateRoutineExercisesRequest,
} from "../../api/routines/routineExercises";
import type {
  CreateRoutineExercisePayload,
  UpdateRoutineExerciseVariables,
} from "../../types/routines/routineExercises";

export default function useRoutineExercises(routineId: number, dayId: number) {
  return useQuery({
    queryKey: ["routineExercise", routineId, dayId],
    queryFn: async () => {
      const res = await routineExercisesRequest(routineId, dayId);
      return res.data;
    },
    enabled: !Number.isNaN(routineId) && !Number.isNaN(dayId),
  });
}

export function useCreateRoutineExercise(routineId: number, dayId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoutineExercisePayload) => {
      const res = await createRoutineExercisesRequest(routineId, dayId, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routineExercise"] });
    },
  });
}

export function useUpdateRoutineExercise(routineId: number, dayId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ exerciseId, data }: UpdateRoutineExerciseVariables) => {
      const res = await updateRoutineExercisesRequest(routineId, dayId, exerciseId, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routineExercise"] });
    },
  });
}

export function useDeleteRoutineExercise(routineId: number, dayId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: number) => {
      const res = await deleteRoutineExercisesRequest(routineId, dayId, exerciseId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routineExercise"] });
    },
  });
}