import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createWeightLogRequest,
  deleteWeightLogRequest,
  weightLogRequest,
} from "../../api/user";
import type { CreateWeightLogPayload } from "../../types/users";

export default function useWeightLog() {
  return useInfiniteQuery({
    queryKey: ["weight-log"],
    queryFn: async ({ pageParam }) => {
      const res = await weightLogRequest(pageParam);
      return res.data;
    },
    initialPageParam: null as string | null,
    // null: no hay más páginas
    getNextPageParam: (lastPage) => lastPage.next,
  });
}

// Un registro nuevo o borrado cambia el peso actual del usuario y el del dashboard
function useInvalidateWeight() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["weight-log"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useCreateWeightLog() {
  const invalidate = useInvalidateWeight();

  return useMutation({
    mutationFn: async (data: CreateWeightLogPayload) => {
      const res = await createWeightLogRequest(data);
      return res.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteWeightLog() {
  const invalidate = useInvalidateWeight();

  return useMutation({
    mutationFn: (id: number) => deleteWeightLogRequest(id),
    onSuccess: invalidate,
  });
}
