import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 0,
                    },
                },
            })
    );

    return (
        <SessionProvider session={session}>
            <QueryClientProvider client={queryClient}>
                <Component {...pageProps} />;
            </QueryClientProvider>
        </SessionProvider>
    );
}
