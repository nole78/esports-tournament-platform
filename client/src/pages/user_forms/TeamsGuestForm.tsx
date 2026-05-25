import { useEffect, useState } from "react";
import type { TeamDto } from "../../models/team/TeamDto";
import { teamApi } from "../../api_services/teams/TeamAPIService";
import { Empty, ErrorBox, PageHeader, Pagination } from "../../components/ui/UI";

export default function TeamsGuestForm(){
    const [teams, setTeams] = useState<TeamDto[]>([]);
    const [error, setError] = useState<string>("");
    const [page, setPage] = useState(1);
    const limit = 20;

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
                    <div key={t.teamId} className="rounded-2xl group relative aspect-4/3 border-2 border-white/5 bg-bgprimary/30 overflow-hidden">
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
            <Pagination page={page} total={limit} pageSize={limit} onChange={setPage}/>
        </div>
    );
}