import { useEffect, useState } from "react";

import { teamApi } from "../../api_services/teams/TeamAPIService";
import { useNavigate } from "react-router-dom";

import { Empty, ErrorBox } from "../../components/ui/UI";
import type { TeamDtoGuest } from "../../models/team/TeamDtoGuest";
import type { UserForMembersDto } from "../../models/user/UserForMembers";
// import type { UserForMembersDto } from "../../models/user/UserForMembers";
// import { useAuth } from "../../hooks/auth/useAuthHook";
// import { usersApi } from "../../api_services/users/UsersAPIService";
// import FireIcon from "../../components/HeroIcons/FireIcon";
// import useDebounce from 'react-debounced';




export const TeamsGuestDetailsForm: React.FC<{id: string}> = ({id}) =>{
    
    const emptyTeam : TeamDtoGuest = {teamId:0 ,teamName:"", teamLogotip:"", teamDescription:"", teamTag:""};
    const [team, setTeam] = useState<TeamDtoGuest>(emptyTeam);
     const [members, setMember] = useState<UserForMembersDto[]>([]);
    // const [userSearch, setUserSearch] = useState<UserForMembersDto[]>([]);
    const [error, setError] = useState<string>("");
    // const { user } = useAuth();
    // const [search, setSearch] = useState<string>("");
    const navigate = useNavigate();


    useEffect(() =>{
        teamApi.getTeamGuest(Number(id))
        .then(res => {
            const teamHelp : TeamDtoGuest = {
                teamId: res.data?.teamId as number,
                teamName:res.data?.teamName as string,
                teamLogotip:res.data?.teamLogotip as string,
                teamDescription:res.data?.teamDescription as string,
                teamTag:res.data?.teamTag as string};
                setTeam(teamHelp);
        }).catch(() => setError("Failed to load the team"))
        //Load the members too
        teamApi.getMembers(Number(id))
                    .then(res =>{
                        setMember(res.data ?? []);
                    }).catch(()=> setError("Failed to load team members"))
        return;
    }, [id])


    return(
        <div className='w-full max-w-sm'>
            {error && <ErrorBox message={error}/>}
        { members.length>0 &&
            <>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-bgsecondary">Team Desctription</h1>
            </div>
           
            <form className='flex flex-col gap-4'>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Team Name</label>
                    <label className="block text-xs text-bgsecondary mb-2 font-bold"> {team.teamName} </label>
                </div>

                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Team Tag</label>
                    <label className="block text-xs text-bgsecondary mb-2 font-bold"> {team.teamTag} </label> </div>
                <div>
                    <label className="mr-5 w-min text-xs text-bgprimary mb-2 font-bold">Team Logo</label>
                    {team.teamLogotip && 
                    <img src={team.teamLogotip} className="mt-2 w-full aspect-4/3 object-cover rounded-lg"/>}
                </div>    
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Team Description</label>
                    <label className="block text-xs text-bgsecondary mb-2 font-bold"> {team.teamDescription} </label>
                </div>
                {/*List out team members + do the captainship transfer + kick out*/}
                <label className="block text-xs text-bgprimary mb-2 font-bold">Member Description</label>
                <div className="w-full overflow-x-auto">
                    
                    <table className="min-w-full text-xs text-bgsecondary font-bold border-collapse">
                        <thead>
                        <tr className="border-b border-gray-200 text-left">
                            <th className=" pb-2 pr-4">Gamer Tag</th>
                            <th className=" pb-2 pr-4">ID</th>
                        </tr>
                        </thead>
                        <tbody>
                            {members.map(m => (
                            <tr key={m.id} className="border-b border-gray-400/30">
                                
                                <td className="flex flex-row items-center gap-1 py-3 pr-4 font-normal text-left">{m.gamerTag} </td>
                            
                                <td className="py-3 pr-4 font-normal text-left">{m.id} </td>

                            </tr>
                            ))
                            }
                        </tbody>
                    </table> 
            
            </div>
            </form>
            <div className="flex gap-2 py-5 pl-30">
                    
                    <button type="button" onClick={() => navigate(-1)}
                        className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-1/2 text-sm transition-colors">
                    Back</button>
                </div>
            </>
            }
               
                { members.length === 0 &&(
                <Empty message="No team found"/>
                
                )}
                

        </div>
    );
}