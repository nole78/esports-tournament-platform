import { useEffect, useState } from "react";
import type { TeamDto } from "../../models/team/TeamDto";
import { teamApi } from "../../api_services/teams/TeamAPIService";
import { Empty, ErrorBox, PageHeader} from "../../components/ui/UI";
import { useNavigate } from "react-router-dom";

export default function TeamsGuestForm(){
    const [teams, setTeams] = useState<TeamDto[]>([]);
    const [error, setError] = useState<string>("");
    const [page, setPage] = useState(1);
    const limit = 6;
    const navigate = useNavigate()
    useEffect(() => {
        teamApi.getAll(page, limit)
            .then(res => {
                if (res.success){
                    setTeams(res.data?.items ?? []);
                } else {
                    setError(res.message);
                }
            })
            .catch(() => setError("Failed to load teams"));
    }, [page]);

    return (
        <div>
            <PageHeader eyebrow="" title="Team Catalog"/>
            {error && <ErrorBox message={error}/>}

            {teams.length === 0 && !error ? <Empty message="No teams found"/> : (
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map(t => (
                    <div onClick= {() => navigate(`/guest/teams/${t.teamId}`)} key={t.teamId} className="rounded-2xl group relative aspect-4/3 border-2 border-white/5 bg-bgprimary/30 overflow-hidden">
                        <div className="w-full h-full">
                            <img src={t.teamLogotip} className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110"/>
                        </div>
                        <div className="absolute rounded-t-lg bg-primary/90 h-min inset-0 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                            <h2 className="text-bgsecondary text-center text-2xl font-bold">{t.teamName}</h2>
                        </div>
                        <div className="absolute rounded-b-lg bottom-0 bg-primary/90 w-full p-2 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                            <span className="float-left font-semibold text-sm text-bgsecondary">{t.teamTag}</span>
                        </div>
                    </div>
                ))}
            </section>
            )}
            
            <div className="flex items-center justify-center gap-4 mt-6">
    <button
        type="button"
        onClick={() => setPage(p => p - 1)}
        disabled={page === 1}
        className="px-4 py-2 text-sm font-semibold rounded-xl border-2 border-gray-400 text-gray-400 bg-gray-400/10
         hover:bg-gray-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
        Previous
    </button>

    <span className="text-sm text-bgsecondary font-bold">Page {page}</span>

    <button
        type="button"
        onClick={() => setPage(p => p + 1)}
        disabled={teams.length < limit}
        className="px-4 py-2 text-sm font-semibold rounded-xl border-2 border-gray-400 text-gray-400 bg-gray-400/10
         hover:bg-gray-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
        Next
    </button>
    </div>
        </div>
    );
}