import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../prisma";
import { AllReposData, CommitData } from "@/types/github";

function shiftArray(arr: number[], steps: number) {
    const length = arr.length;

    if (steps < 0) {
        steps *= -1;
        const leftShifted = arr
            .slice(steps % length)
            .concat(arr.slice(0, steps % length));
        return leftShifted;
    } else {
        if (steps === 0) return arr;
        const rightShifted = arr
            .slice(length - (steps % length))
            .concat(arr.slice(0, length - (steps % length)));
        return rightShifted;
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "GET") {
        try {
            const session = await getServerSession(req, res, authOptions);
            if (!session) return res.status(401).end("No session!");

            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                },
            });
            if (!user) return res.status(401).end("You must be logged in");

            let { timezone } = req.query as { timezone: string | number };
            timezone = +timezone;
            if (!timezone) timezone = 0;

            const allReposLink = `https://api.github.com/search/repositories?q=user:${user.username}`;
            const response = await fetch(allReposLink, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            const reposData: AllReposData = await response.json();

            let commitsMap: { [key: string]: number[] } = {};

            for (let repo of reposData.items) {
                let page = 1;
                let totalPages = 0;
                let allCommitsData: CommitData[] = [];

                const commitsUrl = `https://api.github.com/repos/${user.username}/${repo.name}/commits?per_page=100&page=${page}`;

                const response = await fetch(commitsUrl, {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                });

                if (response.headers.has("link")) {
                    // @ts-ignore
                    let responseLinks = [response.headers.get("link")][0]
                        .split(",")
                        .map((v) => v.trimStart());

                    totalPages = +responseLinks[responseLinks.length - 1]
                        .split("&page=")[1]
                        .split(">; ")[0];
                }

                const pageOfCommitData: CommitData[] = await response.json();
                allCommitsData.push(...pageOfCommitData);

                if (totalPages >= 2) {
                    for (let i = 2; i <= totalPages; i++) {
                        const commitsUrl = `https://api.github.com/repos/${user.username}/${repo.name}/commits?per_page=100&page=${i}`;

                        const response = await fetch(commitsUrl, {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        });

                        const pageOfCommitData: CommitData[] =
                            await response.json();
                        allCommitsData.push(...pageOfCommitData);
                    }
                }

                for (let commitData of allCommitsData) {
                    const hour = new Date(
                        commitData.commit.author.date,
                    ).getHours();
                    const year = new Date(
                        commitData.commit.author.date,
                    ).getFullYear();

                    if (commitsMap[year]) {
                        commitsMap[year][hour] = commitsMap[year][hour] + 1;
                    } else {
                        commitsMap[year] = new Array(24).fill(0);
                        commitsMap[year][hour] = commitsMap[year][hour] + 1;
                    }
                }
            }

            if (process.env.NODE_ENV === "production") {
                for (let year in commitsMap) {
                    const newArr = shiftArray(commitsMap[year], timezone);
                    commitsMap[year] = [...newArr];
                }
            }

            return res.status(200).json(commitsMap);
        } catch (error) {
            return res.status(500).end("Something went wrong...");
        }
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}
