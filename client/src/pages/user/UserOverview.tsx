import { useEffect, useState } from "react";
import { usersApi } from "../../api_services/users/UsersAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { ErrorBox } from '../../components/ui/UI';
import type { UserDto } from "../../models/user/UserTypes";

export default function UserOverview() {
  const {user} = useAuth();
  const [error,setError] = useState("");
  const [userInfo,setUserInfo] = useState<UserDto>();

  useEffect(() => {
    usersApi.getById(user?.id ?? 0)
    .then(res => {
      setUserInfo({
        id: res.data?.id ?? 0,
        gamerTag: res.data?.gamerTag ?? "",
        fullName: res.data?.fullName ?? "",
        email: res.data?.email ?? "",
        isActive: res.data?.isActive ?? 1,
        profilePicture: res.data?.profilePicture ?? "",
        role: res.data?.role ?? "player",
      })
    })
    .catch(err => err? setError(err):setError("Couldn't load user info"))
  },[user])

  return (
<div className="w-1/2 flex mx-auto justify-center items-center py-10 bg-bgprimary/60 rounded-xl">
      <div className="flex flex-col items-center gap-4">

        {error && <ErrorBox message={error} />}

        {userInfo?.profilePicture && (
          <img
            src={userInfo.profilePicture}
            draggable={false}
            alt="Profile"
            className="rounded-xl w-40 h-40 object-cover"
          />
        )}

        <div className="flex flex-col items-center gap-2">
          <div>
            <strong className="text-bgsecondary">ID:</strong> 
            {userInfo?.id && <span className="ml-2 text-primary">{userInfo.id}</span>}
          </div>
          <div>
            <strong className="text-bgsecondary">Gamer Tag:</strong> 
            {userInfo?.gamerTag && <span className="ml-2 text-primary">{userInfo.gamerTag}</span>}
          </div>
          <div>
            <strong className="text-bgsecondary">Full Name:</strong> 
            {userInfo?.fullName && <span className="ml-2 text-primary">{userInfo.fullName}</span>}
          </div>
          <div>
            <strong className="text-bgsecondary">Email:</strong> 
            {userInfo?.email && <span className="ml-2 text-primary">{userInfo.email}</span>}
          </div>
          <div>
            <strong className="text-bgsecondary">Role:</strong> 
            {userInfo?.role && <span className="ml-2 text-primary">{userInfo.role}</span>}
          </div>
          <div>
            <strong className="text-bgsecondary">Status:</strong>{" "}
            <span className="ml-2 text-primary">{userInfo?.isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
