import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import routinesRequest, {
  createRoutineRequest,
  deleteRoutineRequest,
  routineDetailRequest,
  updateRoutineRequest,
} from "../../api/routines/routines";
import type {
  CreateRoutinePayload,
  UpdateRoutineVariables,
} from "../../types/routines/routines";

export default function useRoutines() {
  return useQuery({
    queryKey: ["routine"],
    queryFn: async () => {
      const res = await routinesRequest();
      return res.data;
    },
  });
}

export function useRoutineDetail(id: number) {
  return useQuery({
    queryKey: ["routine", id],
    queryFn: async () => {
      const res = await routineDetailRequest(id);
      return res.data;
    },
    enabled: !Number.isNaN(id),
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoutinePayload) => {
      const res = await createRoutineRequest(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routine"] });
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateRoutineVariables) => {
      const res = await updateRoutineRequest(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routine"] });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteRoutineRequest(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routine"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
