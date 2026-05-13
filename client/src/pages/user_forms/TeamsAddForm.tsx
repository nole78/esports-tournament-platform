import { useRef, useState } from 'react';
import type { TeamDto } from '../../models/team/TeamDto';
import type { ITeamAPIService } from '../../api_services/teams/ITeamAPIService';
import { useNavigate } from 'react-router-dom';
import { TeamRole } from '../../../../server/src/Domain/enums/TeamRole';
//import { teamApi } from '../../api_services/teams/TeamAPIService';
//import { TeamDto, TeamDto } from '../../../../server/src/Domain/DTOs/teams/TeamDto';

export default function TeamsAddForm({teamApi} : {teamApi:ITeamAPIService}){
    const emptyTeam : TeamDto = {teamId: 0, teamName:"", teamLogotip:"", teamDescription:"", teamTag:"", userRole: TeamRole.MEMBER};
    const [team, setTeam] = useState<TeamDto>(emptyTeam);
    
    const [error, setError] = useState<string>("");
    const [preview,setPreview] = useState<string>("");

    const [creating,setCreating] = useState<boolean>(false);

    const fileRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const submit = async (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setError("");

        setCreating(true);

        const res = await teamApi.create({team});

        setCreating(false);
        if (!res.success || !res.data){setError(res.message ?? "Invalid values"); return;}

        
        navigate("/teams", {state: {added : true} });
    }

    return(
        <div className='w-full max-w-sm'>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-bgsecondary">Team Adder</h1>
                <p className="text-sm text-secondary mt-1">Add new team</p>
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
                             setPreview("");
                              return;}

                        const reader = new FileReader();

                        reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setTeam(x => ({...x, teamLogotip : base64String}))
                            setPreview(base64String);
                        }

                        reader.readAsDataURL(file);
                    }}
                    className="hidden w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    
                    {preview && 
                    <img src={preview} className="mt-2 w-full aspect-4/3 object-cover rounded-lg"/>}
                </div>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Team Description</label>
                    <input type="text" value={team.teamDescription} onChange={e => setTeam(x => ({...x, teamDescription : e.target.value}))} placeholder="team_description"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div className="flex gap-2">
                    <button type="submit" disabled={creating}
                        className="w-1/2 cursor-pointer bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                        {creating ? "Creating…" : "Create"}
                    </button>
                    <button type="button" onClick={() => navigate("/teams")}
                        className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-1/2 text-sm transition-colors">
                    Cancel</button>
                </div>
            </form>
        </div>
    );
}