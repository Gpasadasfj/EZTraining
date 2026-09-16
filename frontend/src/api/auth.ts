import type { AuthTokens, LoginCredentials } from "../types/auth";
import api from "./axios";

export default function loginRequest(username:string, password:string) {
    const credentials: LoginCredentials = { username, password }

    return api.post<AuthTokens>("token/", credentials)
}