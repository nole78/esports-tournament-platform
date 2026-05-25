import { useEffect, useState } from "react";
import { usersApi } from "../../api_services/users/UsersAPIService";
import avatarPlaceholder from "../../assets/avatar_placeholder.jpg";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { ErrorBox, RoleBadge } from '../../components/ui/UI';
import type { UserDto } from "../../models/user/UserTypes";

export default function UserOverview() {
  const {user} = useAuth();
  const [error,setError] = useState("");
  const [userInfo,setUserInfo] = useState<UserDto>();
  const [open, setOpen] = useState<boolean>(false);
  const [image, setImage] = useState<string>("");

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
<div className="w-1/2 flex mx-auto justify-center items-center py-10 bg-primary border-bgprimary/80 border-3 shadow-[0_0_25px] shadow-bgprimary/80 rounded-xl mt-25 min-w-110">

        {error && <ErrorBox message={error} />}
        {userInfo && (
        <div className="grid lg:grid-cols-2 sm:grid-cols-1 items-center lg:gap-10 sm:gap-1">
          <div className="relative w-40 h-40 justify-self-center">
            <img draggable={false} alt="Profile" className="w-40 h-40 object-cover rounded-full image-rendering-auto justify-self-center cursor-pointer" onClick={() => {setOpen(true); setImage(userInfo.profilePicture ? userInfo.profilePicture : avatarPlaceholder);} } src = {userInfo.profilePicture ? userInfo.profilePicture : avatarPlaceholder}/>
            <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <div className={`w-6 h-6 rounded-full ${
                            userInfo.isActive
                                ? "animate-pulse bg-green-500 shadow-[0_0_8px_#22c55e]"
                                : "bg-bgsecondary/30"
                        }`}/>
              </div>
          </div>

        <div className="grid sm:grid-rows-3 lg:grid-rows-6 sm:grid-cols-2 lg:grid-cols-1 sm:col-1 lg:col-2 gap-1 mt-2">
          <div className="col-1 row-1">
            <strong className="text-bgsecondary">Gamer Tag:</strong>
          </div>
          <div className="sm:col-2 lg:col-1 sm:row-1 lg:row-2">
            <span className="text-bgprimary">{userInfo.gamerTag} <RoleBadge role={userInfo.role}/></span>
          </div>
          <div className="sm:col-1 lg:col-1 sm:row-2 lg:row-3">
            <strong className="text-bgsecondary">Full Name:</strong>
          </div>
          <div className="sm:col-2 lg:col-1 sm:row-2 lg:row-4">
            <span className="text-bgprimary">{userInfo.fullName}</span>
          </div>
          <div className="sm:col-1 lg:col-1 sm:row-3 lg:row-5">
            <strong className="text-bgsecondary">Email:</strong>
          </div>
          <div className="sm:col-2 lg:col-1 sm:row-3 lg:row-6">
            <span className="text-bgprimary">{userInfo.email}</span>
          </div>
        </div>
        </div>
        )}
    {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-grayscale-50" onClick={() => setOpen(false)}/>
          <div className="absolute top-4 right-4 bg-red-400/40 border-2 border-red-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-red-500 hover:text-bgsecondary text-2xl font-bold cursor-pointer px-4 py-2 rounded-full" onClick={() => setOpen(false)}>X</div>
            <div className=" relative w-85 rounded-3xl p-6">
              <img draggable={false} alt="Profile" className="w-64 h-64 object-cover image-rendering-auto justify-self-center cursor-pointer" onClick={() => setOpen(true)} src = {image}/>
            </div>
          </div>
      )}
    </div>
  );
}
