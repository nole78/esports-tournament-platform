import { useState } from "react";
import { ErrorBox, SuccessBox } from "../ui/UI";
import { usersApi } from "../../api_services/users/UsersAPIService";



export default function ChangeInfoForm(){
    const [oldPassword,setOldPassword] = useState("");
    const [password,setPassword] = useState("");
    const [passwordConfirm,setConfirm] = useState("");
    const [error,setError] = useState("");
    const [succes,setSucces] = useState("");
    const [updating, setUpdating] = useState(false);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setError(""); setUpdating(true);

        await usersApi.updatePassword({
            oldPassword: oldPassword,
            newPassword: password,
        })
        .then(res => {
            if(res.success)
            {
                setSucces(res.message);
                setTimeout(() => {setSucces("")}, 3000);
            }
            else
                setError(res.message);
            setPassword("");
            setConfirm("");
        })
        .catch(() => {setError("Failed password change")})
        setUpdating(false);
    }

    return(
        <div>
            {error && <ErrorBox message={error}/>}
            {succes && <SuccessBox message={succes}/>}
            <form onSubmit={submit}>
                <div className="flex flex-col gap-4">
                    <div className="flex-row w-2/3">
                        <label className="block text-xs text-bgprimary mb-2 font-medium capitalize">Old Password</label>
                        <input
                        required
                        disabled = {updating}
                        type="password"
                        value={oldPassword} onChange={e => {setOldPassword(e.target.value)}}
                        className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div className="flex-row w-2/3">
                        <label className="block text-xs text-bgprimary mb-2 font-medium capitalize">New Password</label>
                        <input
                        required
                        disabled = {updating}
                        type="password"
                        value={password} onChange={e => {setPassword(e.target.value)}}
                        className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div className="flex-row w-2/3">
                        <label className="block text-xs text-bgprimary mb-2 font-medium capitalize">Confirm Password</label>
                        <input
                        required
                        disabled = {updating}
                        type="password"
                        value={passwordConfirm} onChange={e => {setConfirm(e.target.value)}}
                        className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div className="mt-5 flex gap-4">
                        <button type="submit" disabled={updating || (password === "" || oldPassword === "" || passwordConfirm === "")}
                            className="w-1/2 cursor-pointer bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                            {updating? "Changing..." : "Change"}
                        </button>
                        <button type="button" onClick={() => {setPassword("");setConfirm("");setOldPassword("")}}
                            className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-1/2 text-sm transition-colors">
                        Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    );
}