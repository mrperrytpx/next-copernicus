import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "DELETE") {
        try {
            const session = await getServerSession(req, res, authOptions);
            if (!session) return res.status(401).end("No session!");

            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                },
            });
            if (!user) return res.status(401).end("You must be logged in");

            await fetch(
                `https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/grant`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            "Basic " +
                            Buffer.from(
                                process.env.GITHUB_CLIENT_ID +
                                    ":" +
                                    process.env.GITHUB_CLIENT_SECRET,
                            ).toString("base64"),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        access_token: user.accessToken,
                    }),
                },
            );

            await prisma.user.delete({
                where: {
                    id: user.id,
                },
            });

            return res.status(204).end();
        } catch (error) {}
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}
