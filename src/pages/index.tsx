import GithubSvg from "../../public/github-mark.svg";
import LogoutSvg from "../../public/logout.svg";
import { useSession, getProviders, signIn } from "next-auth/react";
import Image from "next/image";
import { InferGetServerSidePropsType } from "next";
import { Plots } from "@/components/Plots";
import { useDeleteUserMutation } from "@/hooks/useDeleteUserMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const App = ({
    providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const session = useSession();
    const queryClient = useQueryClient();
    const allProviders = Object.values(providers);
    const deleteMutation = useDeleteUserMutation();
    const router = useRouter();

    const deleteUser = async () => {
        await deleteMutation.mutateAsync();
        queryClient.clear();
        router.reload();
    };

    return (
        <div className="flex min-h-full flex-col gap-16 px-6 py-6 lg:px-12">
            {!session.data?.user.id &&
                allProviders.map((provider) => (
                    <button
                        aria-label={`${provider.name} sign in.`}
                        key={provider.id}
                        className="group mx-auto mb-2 flex h-[2.5rem] w-full max-w-[200px] items-center justify-center gap-2 rounded-lg bg-white text-sm transition-all duration-75 "
                        onClick={() => signIn(provider.id)}
                    >
                        <div className="rounded-sm bg-white p-2">
                            <Image
                                className="h-[1.125rem] w-[1.125rem]"
                                src={GithubSvg}
                                alt="Github Logo"
                                width={18}
                                height={18}
                            />
                        </div>
                        <span className="text-glacier-900 pr-2 font-medium">
                            Sign in with {provider.name}
                        </span>
                    </button>
                ))}

            {session?.data?.user.id && (
                <div className="flex select-none items-center justify-center gap-2 self-center border-b-2  border-black px-4 text-sm text-black transition-all duration-75">
                    <div className="p-2">
                        <Image
                            className="aspect-square w-[1.5rem] rounded-full"
                            src={session.data.user.image}
                            alt={` Github image`}
                            width={18}
                            height={18}
                        />
                    </div>
                    <span className="pr-2 font-medium">
                        {session.data.user.username}
                    </span>
                    {deleteMutation.isPending ? (
                        <LoadingSpinner />
                    ) : (
                        <button
                            disabled={deleteMutation.isPending}
                            title="Logout"
                            onClick={() => deleteUser()}
                            aria-label="Logout"
                        >
                            <Image
                                src={LogoutSvg}
                                className="w-[2.5rem] p-2"
                                alt="Logout button"
                            />
                        </button>
                    )}
                </div>
            )}
            <Plots />
        </div>
    );
};

export default App;

export async function getServerSideProps() {
    // const session = await getSession(context);

    // // If the user is already logged in, redirect.
    // // Note: Make sure not to redirect to the same page
    // // To avoid an infinite loop!
    // if (session) {
    //     return { redirect: { destination: "/", permanent: false } };
    // }

    const providers = await getProviders();

    return {
        props: { providers: providers ?? [] },
    };
}
