import { useEffect, useState } from "react";
import { teamApi } from "../../api_services/teams/TeamAPIService";
import type { IniviteDto } from '../../models/invite/InviteDto';
import { Empty } from "../../components/ui/UI";


export default function TeamsInboxForm(){
    const [invites, setInvites] = useState<IniviteDto[]>([]);
    const [teamNames, setTeamNames] = useState<Record<number, string>>({});
    const [teamImages, setTeamImages] = useState<Record<number, string>>({});
    const [inviteStatus, setInviteStatus] = useState<Record<number, "accepted" | "rejected">>({});

    const answer = async (teamId: number, ans: string) => {
    setInviteStatus(prev => ({
        ...prev,
        [teamId]: ans === "YES" ? "accepted" : "rejected"
    }));

    const res = await teamApi.inviteRespond(teamId, ans);

    if (res.success) {
        setTimeout(() => {
            setInvites(prev =>
                prev.filter(i => i.teamId !== teamId)
            );
        }, 800);
    }
};

    useEffect(() => {
    const fetchData = async () => {
        const inviteRes = await teamApi.userInvites();

        if (inviteRes.success) {
            const inviteData = inviteRes.data ?? [];
            setInvites(inviteData);

            const names: Record<number, string> = {};
            const images: Record<number, string> = {};

            for (const invite of inviteData) {
                const teamRes = await teamApi.getById(invite.teamId);

                names[invite.teamId] =
                    teamRes.success
                        ? teamRes.data?.teamName ?? "Unknown"
                        : "Unknown";
                images[invite.teamId] =
                    teamRes.success
                        ? teamRes.data?.teamLogotip ?? ""
                        : ""
            }
            setTeamNames(names);
            setTeamImages(images);
        }
    };
    fetchData();
}, []);

    return(
        <div>
            {invites.length == 0 ? <Empty message="You currently have no pending invites"/> : (
                <section className="grid sm:grid-cols-1 lg:grid-cols-1">
                {invites.map(i => { 
                    return (
                    <div key={i.teamId} className={`bg-white/2 border border-white/6 p-4 relative rounded-2xl overflow-hidden transition-all duration-1000
                        ${
                            inviteStatus[i.teamId] == "accepted"
                                ? "border-green-500"
                                : inviteStatus[i.teamId] == "rejected"
                                ? "border-red-500 opacity-70"
                                : ""
                        }
                    `}>
                    {inviteStatus[i.teamId] && (
                    <div
                        className={`absolute inset-0 z-20 flex items-center justify-center rounded-xl animate-pulse transition-all duration-1000
                            ${
                                inviteStatus[i.teamId] == "accepted"
                                    ? "bg-green-400/60"
                                    : "bg-red-400/60"
                            }
                        `}>
                        <p className="text-2xl font-bold tracking-widest animate-pulse">
                            {inviteStatus[i.teamId] == "accepted"
                                ? <span className="text-green-500">INVITE ACCEPTED</span>
                                : <span className="text-red-500">INVITE REJECTED</span>}
                        </p>
                    </div>
                    )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="overflow-hidden rounded-xl shrink-0 w-16 h-16">
                                <img src={teamImages[i.teamId]} className="w-full aspect-square object-cover rounded-xl cursor-pointer transition-transform duration-300 hover:scale-110"/>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <div className="grid grid-cols-1 text-xs font-mono">
                                    <div className="min-w-0">
                                        <p className="text-bgprimary tracking-wider text-[15px] mb-1.5">
                                            You were invited to join the <span className="text-bgsecondary">{teamNames[i.teamId]}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col overflow-hidden mt-2">
                            <div className="grid grid-cols-2 text-xs font-mono">
                                <div className="max-w-45">
                                    <p className="text-bgprimary tracking-wider text-[15px] mb-1.5">
                                        You were invited at <span className="text-bgsecondary/40">{new Date(i.invitedAt).toLocaleString()}</span>
                                    </p>
                                </div>
                                <div className="grid grid-rows-2 text-xs font-mono">
                                    <button onClick={() => answer(i.teamId, "YES")} className="cursor-pointer mb-2 bg-green-400/40 border-2 border-green-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-green-500 font-semibold rounded-xl p-1 text-sm transition-colors">
                                        Accept
                                    </button>
                                    <button onClick={() => answer(i.teamId, "NO")} className="cursor-pointer mb-2 bg-red-400/40 border-2 border-red-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-red-500 font-semibold rounded-xl p-1 text-sm transition-colors">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                    </div>)
                    }
                )}
                </section>)}
        </div>
    );
}