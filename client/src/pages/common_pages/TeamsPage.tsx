import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { TeamDto } from "../../models/team/TeamDto";
import { useLocation, useNavigate } from 'react-router-dom';
import { teamApi } from "../../api_services/teams/TeamAPIService";
import { Empty, ErrorBox, PageHeader} from "../../components/ui/UI";
import { TeamRole } from "../../types/teamMembers/teamMemberRole";



export default function TeamsPage(){
    const {user} = useAuth();
    const [teams, setTeams] = useState<TeamDto[]>([]);
    const [error, setError] = useState<string>("");
    const [deleted, setDeleted] = useState<boolean>(false);
    const location = useLocation();
    const [added, setAdded] = useState<boolean>(location.state?.added ?? false);
    const [edited, setEdited] = useState<boolean>(location.state?.edited ?? false);
     const [left, setLeft] = useState<boolean>(location.state?.left ?? false);
    const [page, setPage] = useState(1);
    const limit = 6;
    const navigate = useNavigate();

    useEffect(()=>{
        if (!edited) return;
        setTimeout(() => {setEdited(false)}, 3000);
    }
    , [edited]);

    useEffect(()=>{
        if(!added) return;
        setTimeout(()=> {setAdded(false)}, 3000);
    },[added]);

    useEffect(()=>{
        if(!left) return;
        setTimeout(()=> {setLeft(false)}, 3000);
    },[left]);

    useEffect(()=>{
        if (location.state?.edited || location.state?.added || location.state?.left){
            navigate(location.pathname, {replace: true, state: {}})
        }
    }, [location.state, location.pathname, navigate]);

    const loadPage = (p : number)=>{
        if (!user?.username) return;

        teamApi.getByGamerTag(p, limit)
        .then((res) => {
            if (res.success){
                setTeams(res.data?.items ?? []);
            }else{
                setError(res.message);
            }
        })
        .catch(() => setError("Failed to load teams"))
    }
    useEffect(() =>{
        loadPage(page);
        
    }, [page]);

    return (
            <div>
                <PageHeader eyebrow="" title="Team Catalog"/>
                <button onClick={() => user?.role == "admin" ? navigate(`/admin/teams/add`) : navigate(`/teams/add`)}
                        className="mb-2 w-1/6 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl py-3 text-sm transition-colors">
                Add Team</button>
                
                {error && <ErrorBox message={error}/>}

                {deleted && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully deleted team
                </div>)}

                {left && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully left team
                </div>)}

                {edited && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully edited team
                </div>)}

                {added && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully added team
                </div>)}

                {teams.length === 0 && !error ? <Empty message="No teams found"/> : (
                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">     
                    {teams.map(t => (
                        <div onClick={() => user?.role == "admin" ? navigate(`/admin/teams/details/${t.teamId}`) : navigate(`/teams/details/${t.teamId}`)} className=" rounded-2xl group relative aspect-4/3 border-2 border-white/5 bg-bgprimary/30 overflow-hidden">
                            <div className="w-full h-full">
                                <img src ={t.teamLogotip} className="object-cover w-full h-full rounded-x1 transition-transform duration-300 group-hover:scale-110"/>
                            </div>
                            <div className="absolute rounded-t-lg bg-primary/90 h-min inset-0 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                                <h2 className="text-bgsecondary text-center text-2xl font-bold">{t.teamName}</h2>
                            </div>
                            
                            <div className="absolute rounded-b-lg bottom-0 bg-primary/90 w-full p-2 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                                <div className="top-0">
                                {(t.userRole === TeamRole.CAPTAIN &&
                                    <>
                                    <button className="w-1/3 mb-2 bg-red-400/40 border-2 border-red-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-red-500 font-semibold rounded-xl p-1 text-sm transition-colors"
                                            onClick={() => {
                                                setDeleted(false);
                                                teamApi.delete(t.teamId)
                                                    .then(res =>{
                                                        if(res.success) {
                                                            setDeleted(true); 
                                                            setTeams(prev => prev.filter(team => team.teamId !== t.teamId));
                                                            setTimeout(() => {setDeleted(false)}, 3000);
                                                            return;}
                                                        else setError(res.message);
                                                    })
                                                    .catch(() => setError("Failed to delete the team"))
                                                }}
                                                >
                                        Delete
                                    </button>
                                    <button className="w-1/3 mb-2 float-right bg-green-400/40 border-2 border-green-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-green-500 font-semibold rounded-xl p-1 text-sm transition-colors"
                                            onClick={() => user?.role == "admin" ? navigate(`/admin/teams/edit/${t.teamId}`) : navigate(`/teams/edit/${t.teamId}`)}
                                            >
                                        Edit
                                    </button>
                                    </>
                                )}
                                    

                                </div>
                                <span className="float-left font-semibold text-sm text-bgsecondary">{t.teamTag}</span>
                            </div>
                        </div>
                    ))
                    }
                </section>
                )}
                
                <div className="flex items-center justify-center gap-4 mt-6">
                <button
                    type="button"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-semibold rounded-xl border-2 border-gray-400 text-gray-400 bg-gray-400/10 hover:bg-gray-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                <span className="text-sm text-bgsecondary font-bold">Page {page}</span>

                <button
                    type="button"
                    onClick={() => setPage(p => p + 1)}
                    disabled={teams.length < limit}
                    className="px-4 py-2 text-sm font-semibold rounded-xl border-2 border-gray-400 text-gray-400 bg-gray-400/10 hover:bg-gray-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}