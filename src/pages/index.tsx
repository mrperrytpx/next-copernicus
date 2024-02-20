import GithubSvg from "../../public/github-mark.svg";
import LogoutSvg from "../../public/logout.svg";
import { useSession, signOut, getProviders, signIn } from "next-auth/react";
import Image from "next/image";
import { InferGetServerSidePropsType } from "next";
import { Plots } from "@/components/Plots";

const App = ({
    providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const session = useSession();

    const allProviders = Object.values(providers);

    return (
        <div className="flex min-h-full flex-col gap-16 px-6 py-6 lg:px-12">
            {!session.data?.user.id &&
                allProviders.map((provider) => (
                    <button
                        aria-label={`${provider.name} sign in.`}
                        key={provider.id}
                        className="group mb-2 flex h-[2.5rem] w-full items-center justify-center gap-2 rounded-lg bg-white text-sm transition-all duration-75 "
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
                    <button title="Logout" onClick={() => signOut()}>
                        <Image
                            src={LogoutSvg}
                            className="w-[2.5rem] p-2"
                            alt="Logout button"
                        />
                    </button>
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
