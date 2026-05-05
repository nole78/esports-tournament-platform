import { useState, useEffect } from "react";
import { Empty, ErrorBox, PageHeader } from "../../components/ui/UI";
import type { GameDto } from "../../models/game/GameDto";
import { gameApi } from "../../api_services/game_catalog/GameAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";


export default function GameCatalog(){
    const {user} = useAuth();
    const [games, setGames] = useState<GameDto[]>([]);
    const [error, setError] = useState<string>("");
    const [deleted, setDeleted] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
                gameApi.getAll()
        .then(res => {
            if(res.success)
                setGames(res.data?.items ?? []);
            else
                setError(res.message);
        })
        .catch(() => setError("Failed to load games"))
    }, []);

    return (
        <Layout>
        <div>
            <PageHeader eyebrow="" title="Game Catalog"/>
            {user?.role === "admin" && (
                <button onClick={() => navigate("/game_catalog/add")}
                        className="mb-2 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-3 text-sm transition-colors">
                Add Game</button>
            )}
            {error && <ErrorBox message={error}/>}
            {deleted && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully deleted game
                </div>
            )}
            {games.length === 0 && !error ? <Empty message="No games found"/> : (
                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {games.map(g => (
                    <div className="border-2 border-bgsecondary bg-bgprimary/30 p-2 rounded-xl">
                        <h2 className="text-bgsecondary text-2xl font-bold">{g.gameName}</h2>
                        <img src={g.gameLogotip}/>
                        {user?.role === "admin" && (<div>
                            <button className="mb-2 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-1 text-sm transition-colors"
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
                                            .catch(() => setError("Failed to delete game"))
                                        }}>
                                Delete
                            </button>
                            <button className="mb-2 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-1 text-sm transition-colors"
                                    onClick={() => navigate(`/game_catalog/edit/${g.gameId}`)}>
                                Edit
                            </button>
                        </div>)}
                        <div className="float-left text-sm text-bgprimary border-2 p-1 border-bgprimary rounded-xl mr-1">Players: {g.gamePlayers}</div>
                        <div className="float-left text-sm text-bgprimary border-2 p-1 border-bgprimary rounded-xl">{g.gameGenre}</div>
                    </div>
                    ))}
                </section>
            )}
        </div>
        </Layout>
    );
}