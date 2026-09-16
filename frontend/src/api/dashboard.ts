import type { DashboardData } from "../types/dashboard";
import api from "./axios";

export default function dashboardRequest() {
    return api.get<DashboardData>("dashboard/")
}