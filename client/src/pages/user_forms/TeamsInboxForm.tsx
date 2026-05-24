import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { teamApi } from "../../api_services/teams/TeamAPIService";
import type { IniviteDto } from '../../models/invite/InviteDto';


export default function TeamsInboxForm(){
    const navigate = useNavigate();
    // const [error, setError] = useState<string>("");
    const load = 0;
    const [invites, setInvites] = useState<IniviteDto[]>([]);

    const answer = async (teamId: number, ans: string)=>{
        await teamApi.inviteRespond(teamId, ans).then(
            res=>{
            if (res.success){
                teamApi.userInvites().then(
            res => {
                if (res.success){
                    setInvites(res.data ?? []);
                }
            })
            }
        })
    }
    useEffect(()=>{
         teamApi.userInvites().then(
            res => {
                if (res.success){
                    setInvites(res.data ?? []);
                }
            })
        // ).catch(()=> setError("Failed to get invites"))
    }, [load])
    return(
        <div>
            <table className="min-w-full text-xs text-bgsecondary font-bold border-collapse">
                                    <thead>
                                    <tr className="border-b border-gray-200 text-left">
                                        <th className=" pb-2 pr-4">Team Id</th>
                                        <th className=" pb-2 pr-4">Invited at</th>
                                        <th colSpan={2} className=" pb-2 pr-4">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {invites.map(i => (
                                        <tr key={i.teamId} className="border-b border-gray-400/30">
                                            <td className="py-3 pr-4 font-normal text-left">{i.teamId}</td>
                                            <td className="py-3 pr-4 font-normal text-left">{new Date(i.invitedAt).toLocaleString()}</td>
                                            <td className="py-3 pr-4 font-normal text-left"> 
                                                <button onClick={() => answer(i.teamId, "YES")} className="inline-flex items-center justify-center bg-green-400/40 border-2 border-gray-400 hover:bg-bgsecondary/30 hover:border-bgsecondary text-gray-400 font-semibold rounded-xl h-8 w-14 text-sm transition-colors mx-auto">
                                                Accept
                                        </button></td>
                                        <td className="py-3 pr-4 font-normal text-left">
                                             <button onClick={() => answer(i.teamId, "NO")} className="inline-flex items-center justify-center bg-red-400/40 border-2 border-gray-400 hover:bg-bgsecondary/30 hover:border-bgsecondary text-gray-400 font-semibold rounded-xl h-8 w-14 text-sm transition-colors mx-auto">
                                                Reject
                                        </button></td>
                                        </tr>
                                        ))
                                        }
                                    </tbody>
                                </table>




            {/* Need to get invites --> for this player */}
             <div className="flex gap-2">
                    
                    <button type="button" onClick={() => navigate(-1)}
                        className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-5/2 text-sm transition-colors">
                    Cancel</button>
                </div>

        </div>
    );
}