import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export const useGetGithubActivity = () => {
    const session = useSession();

    const fetchActivity = async (signal: AbortSignal) => {
        const userTimezone = (new Date().getTimezoneOffset() / 60) * -1;

        const response = await fetch(
            `/api/github/all-repositories?timezone=${userTimezone}`,
            {
                signal,
            },
        );
        const data = await response.json();
        return data as { [key: string]: number[] };
    };

    return useQuery({
        queryKey: ["github-repos"],
        queryFn: ({ signal }) => fetchActivity(signal),
        enabled: !!session?.data?.user.id,
        staleTime: Infinity,
    });
};
