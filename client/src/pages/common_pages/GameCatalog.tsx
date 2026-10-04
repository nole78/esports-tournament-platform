import { useState } from "react";
import { Empty, ErrorBox, PageHeader, Pagination } from "../../components/ui/UI";
import { gameApi } from "../../api_services/game_catalog/GameAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useNavigate } from "react-router-dom";
import placeholder from "../../assets/placeholder.png";
import { Button } from "../../components/ui/Button";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";


export default function GameCatalog(){
    const {user} = useAuth();
    const [actionError, setActionError] = useState<string>("");
    const [deleted, setDeleted] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const limit = 9;
    const queryClient = useQueryClient();

    const {data, isLoading, error} = useQuery({
        queryKey: ["games", page],
        queryFn: async () => {
            const res = await gameApi.getAll(page, limit);
            if(!res.success) {
                throw new Error(res.message ?? "Request failed");
            }
            return res.data;
        },
        placeholderData: keepPreviousData
    })

    const games = data?.items ?? [];
    const total = data?.total ?? 0;
    const errrorMessage = error instanceof Error ? error.message : (actionError || "");

    return (
        <div>
            <PageHeader eyebrow="" title="Game Catalog"/>
            {/* Ade game button render*/}
            {user?.role === "admin" && (
                <Button variant="secondary" className="mb-6" onClick={() => navigate("/admin/game_catalog/add")}>
                    Add Game
                </Button>
            )}
            {/* Error message*/}
            {errrorMessage && <ErrorBox message={errrorMessage}/>}
            {deleted && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully deleted game
                </div>
            )}
            {/* Loading indicator*/}
            {isLoading && games.length === 0 ? (
                <p>Loading...</p>
                ) : games.length === 0 && !errrorMessage ? (
                <Empty message="No games found"/>
                ) : (
                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {games.map(g => (
                    <article className="group surface relative aspect-[4/3] overflow-hidden transition-shadow duration-200 hover:shadow-lg hover:shadow-secondary/20" key={g.gameId}>
                        <div className="w-full h-full">
                            <img src={g.gameLogotip ? g.gameLogotip : placeholder} alt={`${g.gameName} logo`} width="640" height="480" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-primary/90 p-4">
                            <h2 className="text-xl font-bold text-bgsecondary">{g.gameName}</h2>
                            <div className="mt-2 flex items-center justify-between text-sm text-bgsecondary/70">
                                <span>{g.gamePlayers}v{g.gamePlayers}</span>
                                <span>{g.gameGenre}</span>
                            </div>
                        </div>
                        {user?.role === "admin" && <div className="absolute right-3 top-3 flex gap-2">
                                <button aria-label={`Delete ${g.gameName}`} className="min-h-10 rounded-lg border border-danger/70 bg-primary/90 px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger/20"
                                        onClick={() => {
                                            setDeleted(false);
                                            setActionError("");
                                            gameApi.delete(g.gameId)
                                                .then(res =>{
                                                    if(res.success) {
                                                        setDeleted(true); 
                                                        queryClient.invalidateQueries({queryKey: ["games"]});
                                                        setTimeout(() => {setDeleted(false)}, 3000);
                                                        return;}
                                                    else setActionError(res.message ?? "Request failed");
                                                })
                                                .catch(() => setActionError("Failed to delete the game"))
                                            }}>
                                    Delete
                                </button>
                                <button aria-label={`Edit ${g.gameName}`} className="min-h-10 rounded-lg border border-bgprimary/70 bg-primary/90 px-3 text-xs font-semibold text-bgprimary transition-colors hover:bg-bgprimary/20"
                                        onClick={() => navigate(`/admin/game_catalog/edit/${g.gameId}`)}>
                                    Edit
                                </button>
                        </div>}
                    </article>
                    ))}
                </section>
            )}
            <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
        </div>
    );
}