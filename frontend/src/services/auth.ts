import loginRequest from "../api/auth";

export default async function loginAndStoreTokens(username: string, password: string): Promise<void> {
    const res = await loginRequest(username, password);
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
}

export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}