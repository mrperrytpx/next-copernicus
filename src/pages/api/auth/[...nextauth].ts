import NextAuth, { AuthOptions, Session } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../prisma";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's name. */
            name: string;
            email: string;
            image: string;
            id: string;
            username: string;
        };
    }
}

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            profile(profile, tokens) {
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    username: profile.login,
                    accessToken: tokens.access_token,
                };
            },
        }),
    ],
    callbacks: {
        session: async ({
            session,
            user,
        }: Awaited<{ session: Session; user: any }>) => {
            if (session?.user && user.id) {
                session.user.id = user.id;
                session.user.username = user.username;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
