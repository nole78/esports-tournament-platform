import { useEffect, useState } from "react";

import { teamApi } from "../../api_services/teams/TeamAPIService";
import { useNavigate } from "react-router-dom";
import type { TeamDto } from "../../models/team/TeamDto"; 

import type { UserForMembersDto } from "../../models/user/UserForMembers";
import { ErrorBox } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { usersApi } from "../../api_services/users/UsersAPIService";
import FireIcon from "../../components/heroIcons/FireIcon";
import useDebounce from 'react-debounced';




export const TeamsDetailForm: React.FC<{id: string}> = ({id}) =>{
    
    const emptyTeam : TeamDto = {teamId:0 ,teamName:"", teamLogotip:"", teamDescription:"", teamTag:"", userRole: "member"};
    const [team, setTeam] = useState<TeamDto>(emptyTeam);
    const [members, setMember] = useState<UserForMembersDto[]>([]);
    const [userSearch, setUserSearch] = useState<UserForMembersDto[]>([]);
    const [error, setError] = useState<string>("");
    const [transfer, setTransfer] = useState<boolean>(false);
    const { user } = useAuth();
    const [search, setSearch] = useState<string>("");
    const navigate = useNavigate();
    const debounce = useDebounce(1000);

    const giveCaptainShip = async (idTransfer: number)=>{
        await teamApi.transferCaptainship(team.teamId, idTransfer).then(
            res=>{
                if (res.success){
                    setTransfer(true);
                    setTimeout(() => {setTransfer(false)}, 3000);
                    teamApi.getById(Number(id))
                    .then(res => {
                        const teamHelp : TeamDto = {
                            teamId: res.data?.teamId as number,
                            teamName:res.data?.teamName as string,
                            teamLogotip:res.data?.teamLogotip as string,
                            teamDescription:res.data?.teamDescription as string,
                            teamTag:res.data?.teamTag as string,
                            userRole:res.data?.userRole as string};
                            setTeam(teamHelp);
                    }).catch(() => setError("Failed to load the team"))

                    teamApi.getMembers(Number(id))
                    .then(res =>{
                        setMember(res.data ?? []);
                    }).catch(()=> setError("Failed to load team members"))
                    return;
                }else setError(res.message);
            }
           
        ).catch(() => setError("Failed to transfer role"));
    }

    const inviteUser = async (username: string) =>{
        await teamApi.inviteMember(team.teamId, username).then(
            res => {
                if (res.success){
                    setTransfer(true);
                    setTimeout(() => {setTransfer(false)}, 3000);
                    teamApi.getById(Number(id))
                    .then(res => {
                        const teamHelp : TeamDto = {
                            teamId: res.data?.teamId as number,
                            teamName:res.data?.teamName as string,
                            teamLogotip:res.data?.teamLogotip as string,
                            teamDescription:res.data?.teamDescription as string,
                            teamTag:res.data?.teamTag as string,
                            userRole:res.data?.userRole as string};
                            setTeam(teamHelp);
                    }).catch(() => setError("Failed to load the team"))

                    teamApi.getMembers(Number(id))
                    .then(res =>{
                        setMember(res.data ?? []);
                    }).catch(()=> setError("Failed to load team members"))

                    setSearch("");
                    return;
                }else setError(res.message);
            }
            
        ).catch(() => setError("Failed to inivte user"));
    }

    const deleteMember = async (teamId:number, userId:number) =>{
        await teamApi.leaveTeam(teamId, userId).then(
            res => {
                if (res.success){
                    teamApi.getMembers(Number(id))
                    .then(res =>{
                        setMember(res.data ?? []);
                    }).catch(()=> setError("Failed to load team members"))
                    return;
                }
            }
        ).catch(() => setError("Failed to delete member"));
    }

    useEffect(() =>{
        teamApi.getById(Number(id))
        .then(res => {
            const teamHelp : TeamDto = {
                teamId: res.data?.teamId as number,
                teamName:res.data?.teamName as string,
                teamLogotip:res.data?.teamLogotip as string,
                teamDescription:res.data?.teamDescription as string,
                teamTag:res.data?.teamTag as string,
                userRole:res.data?.userRole as string};
                setTeam(teamHelp);
        }).catch(() => setError("Failed to load the team"))
    }, [id])

    useEffect(()=>{
        teamApi.getMembers(Number(id))
        .then(res =>{
            setMember(res.data ?? []);
        }).catch(()=> setError("Failed to load team members"))
    }, [id])
    
    useEffect(()=>{
        debounce(()=>{
        usersApi.searchUsername(search)
        .then(res =>{
            setUserSearch(res.data ?? []);
        }).catch(()=> setError("Failed to load searched users"))
    })
    }, [search])

    return(
        <div className='w-full max-w-sm'>
            {error && <ErrorBox message={error}/>}
            {transfer && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Successfully transfered capitanship
                </div>)}
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
                            { team.userRole === "captain" && (
                            <>
                               
                            </>
                            )
                            }
                            { team.userRole === "member" && (
                            <>
                                
                            </>
                            )
                            }
                        </tr>
                        </thead>
                        <tbody>
                            {members.map(m => (
                            <tr key={m.id} className="border-b border-gray-400/30">
                                { team.userRole === "captain" && user?.id === m.id as number && <td className="flex flex-row items-center gap-1 py-3 pr-4 font-normal text-left">{m.gamerTag} <FireIcon/> </td>}
                                { team.userRole === "member" && user?.id === m.id as number && <td className="flex flex-row items-center gap-1 py-3 pr-4 font-normal text-left">{m.gamerTag} </td>}
                                {  user?.id !== m.id && <td className="py-3 pr-4 font-normal text-left">{m.gamerTag}  </td>}
                                <td className="py-3 pr-4 font-normal text-left">{m.id} </td>

                                { team.userRole === "captain" && user?.id !== m.id as number &&(
                                <>
                                <td className="py-2 font-normal text-center">
                                    <button type="button" onClick={() => giveCaptainShip(m.id)} className="inline-flex items-center justify-center bg-gray-400/40 border-2 border-gray-400 hover:bg-bgsecondary/30 hover:border-bgsecondary text-gray-400 font-semibold rounded-xl h-8 w-16 text-sm transition-colors mx-auto">
                                             Promote
                                        </button>
                                </td>
                                <td className="py-2 font-normal text-center">
                                    <button type="button" onClick={() => deleteMember(team.teamId, m.id)} className="inline-flex items-center justify-center bg-gray-400/40 border-2 border-gray-400 hover:bg-bgsecondary/30 hover:border-bgsecondary text-gray-400 font-semibold rounded-xl h-8 w-10 text-sm transition-colors mx-auto">
                                            Kick
                                        </button>
                                </td>
                                </>
                                )
                                 }
                                 { team.userRole === "member" && user?.id === m.id as number &&(
                                <>
                                <td className="py-2 font-normal text-center">
                                    <button type="button" onClick={() => deleteMember(team.teamId, user.id)} className="inline-flex items-center justify-center bg-gray-400/40 border-2 border-gray-400 hover:bg-bgsecondary/30 hover:border-bgsecondary text-gray-400 font-semibold rounded-xl h-8 w-10 text-sm transition-colors mx-auto">
                                            Leave
                                        </button>
                                </td>
                                </>
                                )
                                 }
                            </tr>
                            ))
                            }
                        </tbody>
                    </table>
                
                
                {team.userRole === "captain" && <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Invite member</label>
                    <input type="text" className=" font-bold" placeholder="Search by username" onChange={(e)=>(setSearch(e.target.value))}></input>
                    {search && userSearch.length > 0 && (
                        <div className="gap-1">
                            {userSearch.map(u => ( 
                                u.id !== user?.id && !members.some(m => m.id === u.id) &&
                                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-400/10 border border-gray-400/20 hover:bg-gray-400/20 transition-colors">
                                    <span className="text-xs text-bgsecondary font-normal">{u.gamerTag}</span>
                                    <button
                                        type="button"
                                        onClick={()=>inviteUser(u.gamerTag)}
                                        className="text-xs px-2 py-1 bg-gray-400/40 border border-gray-400 hover:bg-bgsecondary/30 hover:border-bgsecondary text-gray-400 font-semibold rounded-lg transition-colors">
                                        Invite
                                    </button>
                                </div>
                                 
                            ))}
                        </div>
                    )}
                    {}
                </div>  
                }
                {search && userSearch.length === 0 &&(
                    <p className="mt-2 text-xs text-gray-400">No users found</p>
                )}
                

                </div>
                <div className="flex gap-2">
                    
                    <button type="button" onClick={() => navigate(-1)}
                        className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-1/2 text-sm transition-colors">
                    Cancel</button>
                </div>
            </form>
        </div>
    );
}