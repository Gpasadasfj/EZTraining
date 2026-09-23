import { useQuery } from "@tanstack/react-query"
import dashboardRequest from "../api/dashboard"

export default function useDashboard() {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await dashboardRequest();   
            return res.data
        }
    })
}