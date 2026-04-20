import { useState, useEffect } from "react";
import { Empty, ErrorBox, PageHeader, Table, TableHead } from "../../components/ui/UI";
import type { GameDto } from "../../models/game/GameDto";
import { gameApi } from "../../api_services/game_catalog/GameAPIService";


export default function GameCatalog(){
    const [games, setGames] = useState<GameDto[]>([]);
    const [error, setError] = useState<string>("");

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
        <div>
            <PageHeader eyebrow="user" title="Game Catalog"/>
            {error && <ErrorBox message="{error}"/>}
            {games.length === 0 && !error ? <Empty message="No games found"/> : (
                <Table>
                    <TableHead columns={["Id","Name","Logo","Genre","Players"]}/>
                    <tbody>
                    {games.map(g => (
                        <tr key={g.gameId} className="border-t border-secondary/50 hover:bg-bgprimary/10 transition-colors">
                            <td className="px-5 py-3.5 text-bgsecondary/40 font-mono text-xs">{g.gameId}</td>
                            <td className="px-5 py-3.5 text-bgsecondary/80 text-sm">{g.gameName}</td>
                            <td className="px-5 py-3.5 text-bgsecondary/40 text-sm">{g.gameLogotip}</td>
                            <td className="px-5 py-3.5 text-bgsecondary/80 text-sm">{g.gameGenre}</td>
                            <td className="px-5 py-3.5 text-bgsecondary/40 text-xs">{g.gamePlayers}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}