import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../prisma";
import { AllReposData, CommitData } from "@/types/github";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "GET") {
        const session = await getServerSession(req, res, authOptions);
        if (!session) return res.status(401).end("No session!");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
        });
        if (!user) return res.status(401).end("You must be logged in");

        const { timezone } = req.query;

        const allReposLink = `https://api.github.com/search/repositories?q=user:${user.username}`;
        const response = await fetch(allReposLink, {
            headers: {
                Authorization: `token ${user.accessToken}`,
            },
        });
        const reposData: AllReposData = await response.json();

        let commitsMap: { [key: string]: number[] } = {};

        for (let repo of reposData.items) {
            const commitsUrl = `https://api.github.com/repos/${user.username}/${repo.name}/commits`;

            const response = await fetch(commitsUrl, {
                headers: {
                    Authorization: `token ${user.accessToken}`,
                },
            });
            const allCommitsData: CommitData[] = await response.json();

            for (let commitData of allCommitsData) {
                const hour = new Date(commitData.commit.author.date).getHours();
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
                commitsMap[year] = [
                    ...commitsMap[year].slice(1),
                    commitsMap[year][0],
                ];
            }
        }

        return res.status(200).json(commitsMap);
    }
}
