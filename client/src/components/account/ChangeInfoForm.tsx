import { useEffect, useRef, useState } from "react";
import placeholder from "../../assets/avatar_placeholder.jpg"
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { UserInfoDto } from "../../models/user/UserInfoDto";
import { usersApi } from "../../api_services/users/UsersAPIService";
import { ErrorBox, SuccessBox } from "../ui/UI";




export default function ChangePasswordForm() {
    const { user } = useAuth();
      const [error,setError] = useState("");
      const [succes,setSucces] = useState("");
      const [userInfo,setUserInfo] = useState<UserInfoDto>();
      const [form, setForm] = useState({ username: "", fullName: "", email: ""});
      const [avatar, setAvatar] = useState("");
      const [updating, setUpdating] = useState(false);
      const [changed, setChanged] = useState(false);
      const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
      const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(user)
        usersApi.getInfo()
        .then(res => {
            setUserInfo({
                gamerTag : res.data?.gamerTag ?? "",
                fullName: res.data?.fullName ?? "",
                profilePicture: res.data?.profilePicture ?? "",
                email: res.data?.email ?? ""});
            setForm({
                username : res.data?.gamerTag ?? "",
                fullName: res.data?.fullName ?? "",
                email: res.data?.email ?? ""});
            setAvatar(res.data?.profilePicture ?? "");
            })
        .catch(() => setError("Couldn't load user information"))
    },[user])

    const cancelChanges = () => {
        if(userInfo)
        {
            setForm({
                    username : userInfo.gamerTag ?? "",
                    fullName: userInfo.fullName ?? "",
                    email: userInfo.email ?? ""});
            setAvatar(userInfo.profilePicture ?? "");
        }
        setChanged(false);
        setError("");
    }

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(""); setUpdating(true);
    
    setError("");
    setSucces("");
 
    const fields : Partial<UserInfoDto> = {}; 
        if(!userInfo || userInfo?.email != form["email"])
            fields.email = form["email"];
        if(!userInfo || userInfo?.fullName != form["fullName"])
            fields.fullName = form["fullName"];
        if(!userInfo || userInfo?.profilePicture != avatar)
            fields.profilePicture = avatar;
        if(!userInfo || userInfo?.gamerTag != form["username"])
            fields.gamerTag = form["username"];

        if(fields)
        await usersApi.update({
            gamerTag: fields.gamerTag,
            fullName: fields.fullName,
            profilePicture: fields.profilePicture,
            email: fields.email,
        })
        .then(res =>{
            if(res.success)
            {
                setSucces(res.message);
                setChanged(false);
                setUserInfo({
                    gamerTag: form["username"] ?? "",
                    fullName: form["fullName"] ?? "",
                    email: form["email"] ?? "",
                    profilePicture: avatar ?? "",
                })
                setTimeout(() => {setSucces("")}, 3000);
            }
            else
                setError(res.message);
        })
        .catch(() => {setError("Failed to update account information");})
        setUpdating(false);
    };

    return(
        <div>
            {error && <ErrorBox message={error}/>}
            {succes && <SuccessBox message={succes}/>}
            <form onSubmit={submit}>
            <div className="flex h-50 items-stretch gap-4">
                <div className="w-1/2 flex-col flex justify-stretch gap-10">
                    <div>
                        <label className="block text-xs text-bgprimary mb-2 font-medium capitalize">Gamer Tag</label>
                        <input
                        disabled = {updating}
                        type="text"
                        value={form["username"]} onChange={(e) => {set("username")(e);if(!userInfo || userInfo?.gamerTag != e.target.value)setChanged(true);else setChanged(false)}} required
                        className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs text-bgprimary mb-2 font-medium capitalize">Email</label>
                        <input
                        disabled = {updating}
                        type="email"
                        value={form["email"]} onChange={(e) => {set("email")(e);if(!userInfo || userInfo?.email != e.target.value)setChanged(true);else setChanged(false)}} required
                        className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                </div>
                <div className="flex f w-1/2 h-full">
                    <button disabled = {updating} onClick={() => {if(fileRef.current)fileRef.current.click()}}
                        type="button" className="cursor-pointer" title="Change avatar">
                        <img src={avatar? avatar:placeholder} className="rounded-xl object-cover h-full"/>
                    </button>
                </div>
                </div>
                <div className=" flex-row w-2/3">
                    <label className="block text-xs text-bgprimary mb-2 font-medium capitalize">Full Name</label>
                    <input
                    disabled = {updating}
                    type="text"
                    value={form["fullName"]} onChange={(e) => {set("fullName")(e);if(!userInfo || userInfo?.email != e.target.value)setChanged(true);else setChanged(false)}} required
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors" />
                </div>
                    <input disabled = {updating} ref={fileRef} className="hidden" type="file" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    if(!file) { setAvatar(""); return;}

                    const reader = new FileReader();

                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        setAvatar(base64String);
                        setChanged(true);
                    }

                    reader.readAsDataURL(file);
                }}/>
            <div className="flex flex-col gap-4">
            <div className="mt-5 flex gap-4">
                <button type="submit" disabled={!changed || updating}
                    className="w-1/2 cursor-pointer bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                    {updating? "Changing..." : "Change"}
                </button>
                <button type="button" onClick={cancelChanges}
                    className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-1/2 text-sm transition-colors">
                Cancel</button>
            </div>
            </div>
            </form>
        </div>
    );
}