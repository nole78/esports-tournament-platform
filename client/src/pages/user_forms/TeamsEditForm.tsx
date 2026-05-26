import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { teamApi } from "../../api_services/teams/TeamAPIService";
import type { TeamDtoEdit } from "../../models/team/TeamDtoEdit";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { UserRole } from "../../types/user/UserRole";


export const TeamsEditForm: React.FC<{id: string}> = ({id}) =>{

    const {user} = useAuth();
    const emptyTeam : TeamDtoEdit = {teamName:"", teamLogotip:"", teamDescription:"", teamTag:""};
    const [team, setTeam] = useState<TeamDtoEdit>(emptyTeam);
    
    const [error, setError] = useState<string>("");
    const [editing,setEditing] = useState<boolean>(false);

    const fileRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const submit = async (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setError("");
        if (team.teamName === ""){
            setError("Team name is required!");
            return;
        }
        if (team.teamTag === ""){
            setError("Team tag is required!");
            return;
        }
        if (team.teamLogotip === ""){
            setError("Team logo is required!");
            return;
        }
        if (team.teamDescription === ""){
            setError("Team description is required!");
            return;
        }
        if (team.teamTag.length < 2 || team.teamTag.length >6 ){
            setError("Team tag must be between 2 and 6 characters");
            return;
        }
        if (team.teamName.length < 2 || team.teamName.length > 80 ){
            setError("Team name must be between 2 and 80 characters");
            return;
        }
        setEditing(true);

        const res = await teamApi.update(Number(id), team);

        setEditing(false);
        if (!res.success){setError(res.message ?? "Invalid values"); return;}

        
        setTeam(emptyTeam);
        if(user?.role === UserRole.ADMIN)
            navigate("/admin/teams", {state: {edited : true} });
        else
            navigate("/teams", {state: {edited : true} });
    }

    useEffect(() =>{
        teamApi.getById(Number(id))
        .then(res => {
            const teamHelp : TeamDtoEdit = {
                teamName:res.data?.teamName as string,
                teamLogotip:res.data?.teamLogotip as string,
                teamDescription:res.data?.teamDescription as string,
                teamTag:res.data?.teamTag as string};
                setTeam(teamHelp);
        }).catch(() => setError("Failed to load the team"))
    }, [id])

    return(
        <div className='w-full max-w-sm'>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-bgsecondary">Team Editor</h1>
                <p className="text-sm text-secondary mt-1">Edit team</p>
            </div>
            {error && (
                <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}
            

            <form onSubmit={submit} className='flex flex-col gap-4'>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Team Name</label>
                    <input type="text" value={team?.teamName} onChange={e => setTeam(x => ({...x, teamName : e.target.value}))} placeholder="team_name"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>

                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Team Tag</label>
                    <input type="text" value={team.teamTag} onChange={e => setTeam(x => ({...x, teamTag : e.target.value}))} placeholder="team_tag"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div>
                    <label className="mr-5 w-min text-xs text-bgprimary mb-2 font-bold">Team Logo</label>
                    <button type="button" className=" rounded-xl w-1/3 py-3 border-bgprimary bg-bgprimary text-primary font-semibold text-sm hover:bg-bgprimary/80 cursor-pointer"
                        onClick={() => {if(fileRef.current) fileRef.current.click()}}
                        >Choose Image</button>
                    <input type="file" accept="image/*" ref={fileRef}
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if(!file) {
                             setTeam(x => ({...x, teamLogotip :""})) ;
                              return;}

                        const reader = new FileReader();

                        reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setTeam(x => ({...x, teamLogotip : base64String}))
                        }

                        reader.readAsDataURL(file);
                    }}
                    className="hidden w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    {team.teamLogotip && 
                    <img src={team.teamLogotip} className="mt-2 w-full aspect-4/3 object-cover rounded-lg"/>}
                </div>    
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Team Description</label>
                    <input type="text" value={team.teamDescription} onChange={e => setTeam(x => ({...x, teamDescription : e.target.value}))} placeholder="team_description"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div className="flex gap-2">
                    <button type="submit" disabled={editing}
                        className="w-1/2 cursor-pointer bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                        {editing ? "Editing…" : "Edit"}
                    </button>
                    <button type="button" onClick={() => navigate(-1)}
                        className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-1/2 text-sm transition-colors">
                    Cancel</button>
                </div>
            </form>
        </div>
    );
}