import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export const useGetGithubActivity = () => {
    const session = useSession();

    const fetchActivity = async () => {
        const response = await fetch("/api/github/all-repositories");
        const data = await response.json();
        return data as number[];
    };

    return useQuery({
        queryKey: ["github-repos"],
        queryFn: fetchActivity,
        enabled: !!session?.data?.user.id,
    });
};
