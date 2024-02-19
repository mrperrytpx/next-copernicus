import GithubSvg from "../../public/github-mark.svg";
import LogoutSvg from "../../public/logout.svg";
import {
    useSession,
    signOut,
    getSession,
    getProviders,
    signIn,
} from "next-auth/react";
import { useGetGithubActivity } from "@/hooks/useGetGithubActivity";
import { randomString } from "@/utils/randomString";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Image from "next/image";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

const App = ({
    providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const session = useSession();
    const repos = useGetGithubActivity();

    const allProviders = Object.values(providers);

    return (
        <div className="flex lg:h-full min-h-full flex-col px-12 py-6 gap-16">
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
                        <span className="pr-2 font-medium text-glacier-900">
                            Sign in with {provider.name}
                        </span>
                    </button>
                ))}
            {session?.data?.user.id && (
                <div className="flex px-4 self-center select-none items-center justify-center gap-2  border-b-2 border-black text-sm text-black transition-all duration-75">
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
            {repos.isLoading ? (
                <div className="text-center space-y-4">
                    <p className="inline">Might take a bit...</p>
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="lg:h-[min(95%,24rem)] justify-center flex-col lg:flex-row flex gap-2">
                    {repos.data?.map((x, i) => (
                        <div
                            className="lg:w-8 h-8 lg:h-full relative"
                            key={randomString(6)}
                        >
                            <div
                                className="border border-black rounded-t-md absolute hidden lg:block text-center bg-yellow-200 hover:bg-yellow-300 top-auto transition-color duration-75 bottom-0 left-0 right-0"
                                style={{
                                    height: `${
                                        (x / Math.max(...repos.data)) * 100
                                    }%`,
                                }}
                            />
                            <div
                                className="border border-black rounded-r-md absolute lg:hidden text-center bg-yellow-200 hover:bg-yellow-300 transition-color duration-75 bottom-0 left-0 top-0"
                                style={{
                                    width: `${
                                        (x / Math.max(...repos.data)) * 100
                                    }%`,
                                }}
                            />
                            <p className="absolute font-medium -left-6 top-0 bottom-0 lg:bottom-auto lg:-top-7 text-center lg:left-0 lg:right-0">
                                {i}
                            </p>
                            <p className="absolute z-50 font-medium -right-6 top-0 bottom-0 lg:top-auto lg:-bottom-6 text-center lg:left-0 lg:right-0">
                                {x}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;

export async function getServerSideProps(context: GetServerSidePropsContext) {
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
