import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import meRequest, {
  removeAvatarRequest,
  updateMeRequest,
  uploadAvatarRequest,
} from "../../api/user";
import type { UpdateUserPayload } from "../../types/users";

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
    onSuccess: (user) => {
      // El PATCH ya devuelve el usuario actualizado: no hace falta volver a pedirlo
      queryClient.setQueryData(["me"], user);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatarRequest(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeAvatarRequest(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}
