import { useGetGithubActivity } from "@/hooks/useGetGithubActivity";
import { randomString } from "@/utils/randomString";
import { LoadingSpinner } from "./LoadingSpinner";
import { Accordion } from "./Accordion";

export const Plots = () => {
    const { data, isLoading } = useGetGithubActivity();

    const stl =
        "lg:h-[24rem] my-8 justify-center flex-col lg:flex-row flex gap-2";

    if (isLoading)
        return (
            <div className="space-y-4 text-center">
                <p className="inline">Might take a bit...</p>
                <LoadingSpinner />
            </div>
        );

    if (!data) return null;

    return Object.entries(data).map(([year, values]) => (
        <Accordion title={year} key={year}>
            <div className="flex select-none items-center justify-between px-1 py-2 text-xs font-bold lg:flex-col-reverse lg:py-[0.375rem]">
                <p>time of day</p>
                <p className="lg:mt-[0.25rem]">commits</p>
            </div>
            {values.map((x, i) => (
                <div
                    key={randomString(6)}
                    className="relative ml-6 mr-10 h-5 first-of-type:mt-4 last-of-type:mb-4 lg:mb-6 lg:ml-0 lg:mr-0 lg:mt-8 lg:h-96 lg:w-8 lg:first-of-type:mt-0 lg:last-of-type:mb-0"
                >
                    <div
                        className="transition-color absolute bottom-0 left-0 right-0 top-auto hidden rounded-t-md border border-black bg-yellow-200 text-center duration-75 hover:bg-yellow-300 lg:block"
                        style={{
                            height: `${(x / Math.max(...values)) * 100}%`,
                        }}
                    />
                    <div
                        className="transition-color absolute bottom-0 left-0 top-0 rounded-r-md border border-black bg-yellow-200 text-center duration-75 hover:bg-yellow-300 lg:hidden"
                        style={{
                            width: `${(x / Math.max(...values)) * 100}%`,
                        }}
                    />
                    <p className="absolute -left-5 bottom-0 top-0 select-none text-right font-medium leading-5 lg:-bottom-[1.375rem] lg:left-0 lg:right-0 lg:top-auto lg:text-center">
                        {i}
                    </p>
                    <p className="absolute -right-7 bottom-0 top-0 select-none text-center font-medium leading-5 lg:-bottom-6 lg:-top-[1.5rem] lg:left-0 lg:right-0">
                        {x}
                    </p>
                </div>
            ))}
        </Accordion>
    ));
};
