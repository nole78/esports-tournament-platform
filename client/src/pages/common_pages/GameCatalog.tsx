import { useState, useEffect } from "react";
import { Empty, ErrorBox, PageHeader, Pagination } from "../../components/ui/UI";
import type { GameDto } from "../../models/game/GameDto";
import { gameApi } from "../../api_services/game_catalog/GameAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useNavigate } from "react-router-dom";


export default function GameCatalog(){
    const {user} = useAuth();
    const [games, setGames] = useState<GameDto[]>([]);
    const [error, setError] = useState<string>("");
    const [deleted, setDeleted] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const limit = 9;

    useEffect(() => {
                gameApi.getAll(page,limit)
        .then(res => {
            if(res.success){
                setGames(res.data?.items ?? []);
                setTotal(res.data?.total ?? 0);
            }
            else
                setError(res.message);
        })
        .catch(() => setError("Failed to load games"))
    }, [page]);

    return (
        <div>
            <PageHeader eyebrow="" title="Game Catalog"/>
            {user?.role === "admin" && (
                <button onClick={() => navigate("/game_catalog/add")}
                        className="cursor-pointer mb-2 w-1/6 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl py-3 text-sm transition-colors">
                Add Game</button>
            )}
            {error && <ErrorBox message={error}/>}
            {deleted && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully deleted game
                </div>
            )}
            {games.length === 0 && !error ? <Empty message="No games found"/> : (
                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {games.map(g => (
                    <div className="group relative aspect-4/3 border-2 h-2xl border-white/5 bg-bgprimary/30  rounded-xl overflow-hidden" key={g.gameId}>
                        <div className="w-full h-full">
                            <img src={g.gameLogotip} className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110"/>
                        </div>
                        <div className="absolute rounded-t-lg bg-primary/90 h-min inset-0 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                            <h2 className="text-bgsecondary text-center text-2xl font-bold">{g.gameName}</h2>
                        </div>
                        <div className="absolute rounded-b-lg bottom-0 bg-primary/90 w-full p-2 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                            {user?.role === "admin" && (<div className="top-0">
                                <button className="cursor-pointer w-1/3 mb-2 bg-red-400/40 border-2 border-red-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-red-500 font-semibold rounded-xl p-1 text-sm transition-colors"
                                        onClick={() => {
                                            setDeleted(false);
                                            gameApi.delete(g.gameId)
                                                .then(res =>{
                                                    if(res.success) {
                                                        setDeleted(true); 
                                                        setGames(prev => prev.filter(game => game.gameId !== g.gameId));
                                                        setTimeout(() => {setDeleted(false)}, 3000);
                                                        return;}
                                                    else setError(res.message);
                                                })
                                                .catch(() => setError("Failed to delete the game"))
                                            }}>
                                    Delete
                                </button>
                                <button className="cursor-pointer w-1/3 mb-2 float-right bg-green-400/40 border-2 border-green-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-green-500 font-semibold rounded-xl p-1 text-sm transition-colors"
                                        onClick={() => navigate(`/game_catalog/edit/${g.gameId}`)}>
                                    Edit
                                </button>
                            </div>)}
                            <span className="float-left font-semibold text-sm text-bgsecondary">{g.gamePlayers}v{g.gamePlayers}</span>
                            <span className="text-sm text-bgsecondary font-semibold float-right">{g.gameGenre}</span>
                        </div>
                    </div>
                    ))}
                </section>
            )}
            <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
        </div>
    );
}