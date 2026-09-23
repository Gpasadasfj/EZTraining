import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWeightLogRequest,
  deleteWeightLogRequest,
  weightLogRequest,
} from "../api/user";
import type { CreateWeightLogPayload } from "../types/users";

export default function useWeightLog() {
  return useQuery({
    queryKey: ["weight-log"],
    queryFn: async () => {
      const res = await weightLogRequest();
      return res.data;
    },
  });
}

export function useCreateWeightLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weight: CreateWeightLogPayload) => {
      const res = await createWeightLogRequest(weight);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight-log"] });
    },
  });
}

export function useDeleteWeightLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteWeightLogRequest(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight-log"] });
    },
  });
}
