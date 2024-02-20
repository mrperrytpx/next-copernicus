import { useMutation } from "@tanstack/react-query";

export const useDeleteUserMutation = () => {
    const deleteUser = async () => {
        await fetch("/api/user/remove", {
            method: "DELETE",
        });
    };

    return useMutation({
        mutationFn: deleteUser,
    });
};
