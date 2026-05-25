import { useEffect, useState } from "react";
import { usersApi } from "../../api_services/users/UsersAPIService";
import { ErrorBox } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { UserDto } from "../../models/user/UserTypes";

type UserOverviewState =
    | { status: "loading" }
    | { status: "error"; error: string }
    | { status: "success"; user: UserDto };

export default function UserOverview({ userId }: { userId?: number }) {
    const { user: authUser } = useAuth();
    const [state, setState] = useState<UserOverviewState>({ status: "loading" });

    useEffect(() => {
        let cancelled = false;
        const resolvedUserId = userId ?? authUser?.id ?? 0;

        async function load() {
            setState({ status: "loading" });
            const res = await usersApi.getById(resolvedUserId);

            if (cancelled) {
                return;
            }

            if (!res.success || !res.data) {
                setState({ status: "error", error: res.message || "Couldn't load user info" });
                return;
            }

            setState({ status: "success", user: res.data });
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [authUser, userId]);

    if (state.status === "loading") {
        return <div className="rounded-xl bg-bgprimary/60 px-6 py-10 text-center text-bgsecondary">Loading player info...</div>;
    }

    if (state.status === "error") {
        return <ErrorBox message={state.error} />;
    }

    const userData = state.user;

    return (
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center rounded-xl bg-bgprimary/60 py-10">
            <div className="flex flex-col items-center gap-4">
                {userData.profilePicture && (
                    <img
                        src={userData.profilePicture}
                        draggable={false}
                        alt="Profile"
                        className="h-40 w-40 rounded-xl object-cover"
                    />
                )}

                <div className="flex flex-col items-center gap-2 text-center">
                    <div>
                        <strong className="text-bgsecondary">ID:</strong>
                        <span className="ml-2 text-primary">{userData.id}</span>
                    </div>
                    <div>
                        <strong className="text-bgsecondary">Gamer Tag:</strong>
                        <span className="ml-2 text-primary">{userData.gamerTag}</span>
                    </div>
                    <div>
                        <strong className="text-bgsecondary">Full Name:</strong>
                        <span className="ml-2 text-primary">{userData.fullName}</span>
                    </div>
                    <div>
                        <strong className="text-bgsecondary">Email:</strong>
                        <span className="ml-2 text-primary">{userData.email}</span>
                    </div>
                    <div>
                        <strong className="text-bgsecondary">Role:</strong>
                        <span className="ml-2 text-primary">{userData.role}</span>
                    </div>
                    <div>
                        <strong className="text-bgsecondary">Status:</strong>{" "}
                        <span className="ml-2 text-primary">{userData.isActive ? "Active" : "Inactive"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
