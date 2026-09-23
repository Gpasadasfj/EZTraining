import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import meRequest, { updateMeRequest } from "../api/user";
import type { UpdateUserPayload } from "../types/users";

export default function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await meRequest();
      return res.data;
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserPayload) => {
      const res = await updateMeRequest(data);
      return res.data;
    },
    onSuccess: () => {
      // Avisa a TanStack Query de que estos datos ya no están actualizados
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
