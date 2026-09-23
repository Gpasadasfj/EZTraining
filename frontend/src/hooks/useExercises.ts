import { useInfiniteQuery } from "@tanstack/react-query";
import exercisesRequest from "../api/exercises";

export default function useExercisesInfinite() {
    return useInfiniteQuery({
        queryKey: ["exercises", "infinite"],
        queryFn: async ({ pageParam }) => {
            const res = await exercisesRequest(pageParam);
            return res.data
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.next
    })
}