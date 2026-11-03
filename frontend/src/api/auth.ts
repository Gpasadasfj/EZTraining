import type {
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
} from "../types/auth";
import api from "./axios";

export default function loginRequest(username: string, password: string) {
  const credentials: LoginCredentials = { username, password };

  return api.post<AuthTokens>("token/", credentials);
}

// Siempre FormData: así la foto opcional viaja en la misma petición
export function registerRequest(data: RegisterPayload, avatar: File | null) {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => form.append(key, value));
  if (avatar) form.append("avatar", avatar);
  return api.post("users/register/", form);
}
