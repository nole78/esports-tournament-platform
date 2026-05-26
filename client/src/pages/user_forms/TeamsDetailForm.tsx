import { useEffect, useState } from "react";

import { teamApi } from "../../api_services/teams/TeamAPIService";
import { useNavigate } from "react-router-dom";
import type { TeamDto } from "../../models/team/TeamDto";


import type { UserForMembersDto } from "../../models/user/UserForMembers";
import { ErrorBox, Table, TableHead } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { usersApi } from "../../api_services/users/UsersAPIService";
//import useDebounce from 'react-debounced';
import type { IniviteDto } from "../../models/invite/InviteDto";
//import type { UserDto } from "../../models/user/UserTypes";
import { TeamRole } from "../../types/teamMembers/teamMemberRole";
import { UserRole } from "../../types/user/UserRole";


//import FireIcon from "../../components/heroIcons/FireIcon";

import FireIcon from "../../components/heroIcons/FireIcon";
import useDebounce from 'react-debounced';
import ArrowLeftIcon from "../../components/heroIcons/ArrowLeftIcon";
import StarIcon from "../../components/heroIcons/StarIcon";
import XMarkIcon from "../../components/heroIcons/XMarkIcon";
import LeaveIcon from "../../components/heroIcons/LeaveIcon";
import SearchIcon from "../../components/heroIcons/SearchIcon";
import avatarPlaceholder from "../../assets/avatar_placeholder.jpg";
import UserOverview from '../../components/account/UserOverview';
import UserPlusIcon from "../../components/heroIcons/UserPlusIcon";

export const TeamsDetailForm: React.FC<{id: string}> = ({id}) =>{
    
    const emptyTeam : TeamDto = {teamId:0 ,teamName:"", teamLogotip:"", teamDescription:"", teamTag:"", userRole: TeamRole.MEMBER};
    const [team, setTeam] = useState<TeamDto>(emptyTeam);
    const [members, setMember] = useState<UserForMembersDto[]>([]);
    const [userSearch, setUserSearch] = useState<UserForMembersDto[]>([]);
    const [invitedMembers, setInvitedMembers] = useState<IniviteDto[]>([]);
    const [error, setError] = useState<string>("");
    const [kicked, setKicked] = useState<boolean>(false);
    const [transfer, setTransfer] = useState<boolean>(false);
    const [invite, setInvite] = useState<boolean>(false);
    const { user } = useAuth();
    const [search, setSearch] = useState<string>("");
    const navigate = useNavigate();
    const debounce = useDebounce(1000);
    const [open, setOpen] = useState(false);
    const [userPreview, setUserPreview] = useState(0);

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
                            userRole:res.data?.userRole as TeamRole};
                            setTeam(teamHelp);
                    }).catch(() => setError("Failed to load the team"))

                    teamApi.getMembers(Number(id))
                    .then(res =>{
                        setMember(res.data ?? []);
                    }).catch(()=> setError("Failed to load team members"))

                    teamApi.getInvitesByTeamId(Number(id))
                    .then(
                        res => {
                            setInvitedMembers(res.data ?? []);
                        }
                    ).catch(()=> setError("Failed to load invites"))
                    return;
                }else setError(res.message);
            }
           
        ).catch(() => setError("Failed to transfer role"));
    }

    const inviteUser = async (username: string) =>{
        await teamApi.inviteMember(team.teamId, username).then(
            res => {
                if (res.success){
                    setInvite(true);
                    setTimeout(() => {setInvite(false)}, 3000);
                    teamApi.getById(Number(id))
                    .then(res => {
                        const teamHelp : TeamDto = {
                            teamId: res.data?.teamId as number,
                            teamName:res.data?.teamName as string,
                            teamLogotip:res.data?.teamLogotip as string,
                            teamDescription:res.data?.teamDescription as string,
                            teamTag:res.data?.teamTag as string,
                            userRole:res.data?.userRole as TeamRole};
                            setTeam(teamHelp);
                    }).catch(() => setError("Failed to load the team"))

                    teamApi.getMembers(Number(id))
                    .then(res =>{
                        setMember(res.data ?? []);
                    }).catch(()=> setError("Failed to load team members"))

                    
                   teamApi.getInvitesByTeamId(Number(id))
                    .then(
                        res => {
                            setInvitedMembers(res.data ?? []);
                        }
                    ).catch(()=> setError("Failed to load invites"))

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
                    teamApi.getInvitesByTeamId(Number(id))
                    .then(
                        res => {
                            setInvitedMembers(res.data ?? []);
                        }
                    ).catch(()=> setError("Failed to load invites"))
                    return;
                }
            }
        ).catch(() => setError("Failed to delete member"));

        if (user?.id === userId){
            if(user?.role === UserRole.ADMIN)
                        navigate("/admin/teams", {state: {left : true} });
                    else
                        navigate("/teams", {state: {left : true} });
        }else{
            setTimeout(()=> {setKicked(false)}, 3000);
        }
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
                userRole:res.data?.userRole as TeamRole};
                setTeam(teamHelp);
        }).catch(() => setError("Failed to load the team"))

        teamApi.getInvitesByTeamId(Number(id))
                    .then(
                        res => {
                            setInvitedMembers(res.data ?? []);
                        }
                    ).catch(()=> setError("Failed to load invites"))
        teamApi.getMembers(Number(id))
        .then(res =>{
            setMember(res.data ?? []);
        }).catch(()=> setError("Failed to load team members"))
    }, [id])

    
    useEffect(()=>{
        if(search !== "")
        {
        debounce(()=>{
        usersApi.searchUsername(search)
        .then(res =>{
            setUserSearch(res.data ?? []);
        }).catch(()=> setError("Failed to load searched users"))
        })}
    }, [search, debounce])

    return(
        <div className='w-full border-secondary border rounded-2xl p-5'>
            {kicked && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully kicked out member
                </div>)}
            {invite && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully invited member
                </div>)}
            {error && <ErrorBox message={error}/>}
            {transfer && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Successfully transfered capitanship
                </div>)}
            <div className="text-center mb-10 border-b-secondary border-b grid grid-cols-4">
                <div onClick={() => navigate(-1)} className="w-1/2 mb-2 flex items-center justify-center gap-2 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl text-sm transition-colors">
                    <span><ArrowLeftIcon/></span> Back</div>
                <span className="text-3xl font-semibold text-bgsecondary col-span-2">Team Desctription</span>
            </div>
           
            <div className='grid grid-cols-2 gap-4 p-5'>
                <div className="columns-1">
                    {team.teamLogotip && 
                    <img src={team.teamLogotip} className="rounded-full object-cover w-64 h-64 border-2 border-secondary shadow-lg shadow-secondary/80"/>}
                </div> 
                <div className="grid grid-rows-2 gap-5 columns-2 mt-10">
                    <div>
                        <span className="block text-2xl text-bgprimary mb-2 font-bold border-b-secondary border-b">Team Name</span>
                        <span className="block text-2xl text-bgsecondary mb-2 font-bold"> {team.teamName} </span>
                    </div>
                    <div>
                        <span className="block text-2xl text-bgprimary mb-2 font-bold border-b-secondary border-b">Team Tag</span>
                        <span className="block text-2xl text-bgsecondary mb-2 font-bold uppercase"> {team.teamTag} </span>
                    </div>   
                </div>
                <div className="col-span-2 mt-4">
                    <span className="block text-2xl text-bgprimary mb-2 font-bold border-b-secondary border-b">Team Description</span>
                    <span className="block text-14 text-bgsecondary mb-2 font-bold"> {team.teamDescription} </span>
                </div>
                <div className="col-span-2 mt-4">
                    <span className="block text-2xl text-bgprimary mb-2 font-bold border-b-secondary border-b">Members</span>
                    <div className="w-full overflow-x-auto mt-6">
                        <Table>
                            <TableHead columns={["Gamer Tag", "ID", "Actions"]}></TableHead>
                            <tbody>
                                {members.map(m => (
                                <tr key={m.id} className="border-b border-gray-400/30">
                                    { team.userRole === "captain" && user?.id === m.id as number && <td className="px-5 py-3.5 font-mono text-xl text-bgsecondary flex"><span className="flex cursor-pointer" onClick={() => {setOpen(true); setUserPreview(m.id)}}>{m.gamerTag} <FireIcon/></span></td>}
                                    { team.userRole === "member" && user?.id === m.id as number && <td className="px-5 py-3.5 font-mono text-xl text-bgsecondary"><span className="cursor-pointer" onClick={() => {setOpen(true); setUserPreview(m.id)}}>{m.gamerTag}</span></td>}
                                    {  user?.id !== m.id && <td className="px-5 py-3.5 font-mono text-xl text-bgsecondary"><span className="cursor-pointer" onClick={() => {setOpen(true); setUserPreview(m.id)}}>{m.gamerTag}</span>   </td>}
                                    <td className="px-5 py-3.5 font-mono text-xl text-bgsecondary">{m.id} </td>

                                    { team.userRole === "captain" && user?.id !== m.id as number &&(
                                    <td>
                                        <div className="grid grid-cols-2 gap-6 px-6">
                                            <button type="button" onClick={() => giveCaptainShip(m.id)} className="columns-1 inline-flex items-center justify-center bg-amber-500/10 text-amber-400 border-amber-500/40 border-2 hover:text-amber-900 hover:bg-amber-400/80 hover:border-amber-900 cursor-pointer font-semibold rounded-xl h-8 w-full text-sm transition-colors">
                                                    <StarIcon/>Promote
                                                </button>
                                            <button type="button" onClick={() => deleteMember(team.teamId, m.id)} className="columns-2 inline-flex items-center justify-center text-red-500 bg-red-400/40 border-2 border-red-500 hover:bg-red-500/80 hover:border-red-900 hover:text-red-900 cursor-pointer font-semibold rounded-xl h-8 w-full text-sm transition-colors">
                                                    <XMarkIcon/>Kick
                                                </button>
                                        </div>
                                    </td>
                                    )
                                    }
                                    { team.userRole === "member" && user?.id === m.id as number &&(
                                    <td className="py-2 px-8 font-normal text-center">
                                        <button type="button" onClick={() => deleteMember(team.teamId, user.id)} className="columns-2 inline-flex items-center justify-center text-red-500 bg-red-400/40 border-2 border-red-500 hover:bg-red-500 hover:border-red-900 hover:text-red-900 cursor-pointer font-semibold rounded-xl h-8 w-full text-sm transition-colors">
                                                <LeaveIcon/> Leave
                                            </button>
                                    </td>
                                    )
                                    }
                                </tr>
                                ))
                                }
                            </tbody>
                        </Table>
                    
                    
                    { team.userRole === "captain" && 
                    <div className="mt-5">
                        <span className="block text-2xl text-bgprimary mb-2 font-bold border-b-secondary border-b">Invite Players</span>
                        <div className="relative flex w-full mt-5">
                            <input type="text" placeholder="Search by username" onChange={(e) => setSearch(e.target.value)} className=" w-1/2 pl-3 pr-4 py-3 rounded-2xl border border-bgprimary/40 bg-secondary/80 text-primary font-semibold placeholder:text-primary/60 outline-none transition-all focus:border-bgprimary focus:ring-2 focus:ring-bgprimary/40"/>
                            <span className="absolute left-8/19 top-1/2 -translate-y-1/2 text-primary pointer-events-none"><SearchIcon/></span>
                        </div>
                        {search && userSearch.length > 0 && (
                            <div className="gap-1 mt-2">
                                {userSearch.filter(u => u.id !== user?.id &&
                                !members.some(m => m.id === u.id) && 
                                !invitedMembers.some(i => i.userId === u.id)
                                    ).map( u => (
                                
                                    <div className="flex mt-0.5 items-center justify-between px-3 py-2 rounded-lg bg-gray-400/10 border border-bgprimary/60 hover:bg-gray-400/20 transition-colors">
                                        <div className="flex">
                                            <img draggable={false} alt="Profile" className="w-7 h-7 object-cover rounded-full image-rendering-auto justify-self-center cursor-pointer" src={u.profilePicture ? u.profilePicture : avatarPlaceholder} 
                                                onClick={() => {setOpen(true); setUserPreview(u.id)}}/>
                                            <span className="text-14 ml-2 text-bgsecondary font-normal">{u.gamerTag}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={()=>inviteUser(u.gamerTag)}
                                            className="text-12 flex px-2 py-1 bg-green-400/40 border-2 border-green-500 hover:bg-green-500/80 hover:border-green-900 text-green-500 hover:text-green-900 font-semibold rounded-lg transition-colors cursor-pointer">
                                            <UserPlusIcon/>Invite
                                        </button>
                                    </div>
                                    ))
                                
                                
                            }
                            </div>
                        )}
                        
                    </div>  
                    }
                    {search && userSearch.length === 0 &&(
                        <p className="mt-2 ml-1 text-14 text-bgprimary">No users found</p>
                    )}
                    
                    </div>
                </div>
            </div>
        {open && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-grayscale-50"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-4 right-4 bg-red-400/40 border-2 border-red-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-red-500 hover:text-bgsecondary text-2xl font-bold cursor-pointer px-4 py-2 rounded-full"
            onClick={() => setOpen(false)}
          >
            X
          </div>
          <div className="relative w-125">
            <UserOverview id={userPreview}/>
          </div>
        </div>
      )}
        </div>
    );
}