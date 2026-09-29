import type { AuthTokens, LoginCredentials, RegisterPayload } from "../types/auth";
import api from "./axios";

export default function loginRequest(username:string, password:string) {
    const credentials: LoginCredentials = { username, password }

    return api.post<AuthTokens>("token/", credentials)
}

export function registerRequest(data: RegisterPayload) {
  return api.post("users/register/", data);
}