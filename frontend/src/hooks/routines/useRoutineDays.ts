import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import routineDaysRequest, {
  createRoutineDaysRequest,
  deleteRoutineDaysRequest,
  updateRoutineDaysRequest,
} from "../../api/routines/routineDays";
import type {
  CreateRoutineDayPayload,
  UpdateRoutineDayVariables,
} from "../../types/routines/routineDays";
import { routineDaysDetailRequest } from "../../api/routines/routineDays";

export default function useRoutineDays(routineId: number) {
  return useQuery({
    queryKey: ["routineDay", routineId],
    queryFn: async () => {
      const res = await routineDaysRequest(routineId);
      return res.data;
    },
    enabled: !Number.isNaN(routineId),
  });
}

export function useRoutineDaysDetail(routineId: number, dayId: number) {
  return useQuery({
    queryKey: ["routineDay", routineId, dayId],
    queryFn: async () => {
      const res = await routineDaysDetailRequest(routineId, dayId);
      return res.data;
    },
    enabled: !Number.isNaN(routineId) && !Number.isNaN(dayId),
  });
}

export function useCreateRoutineDays(routineId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoutineDayPayload) => {
      const res = await createRoutineDaysRequest(routineId, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routineDay"] });
    },
  });
}

export function useUpdateRoutineDays(routineId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dayId, data }: UpdateRoutineDayVariables) => {
      const res = await updateRoutineDaysRequest(routineId, dayId, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routineDay"] });
    },
  });
}

export function useDeleteRoutineDays(routineId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteRoutineDaysRequest(routineId, id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routineDay"] });
    },
  });
}
