import { useEffect, useState } from "react";
import { gameApi } from "../../api_services/game_catalog/GameAPIService";

export const GameEditForm: React.FC<{id: string }> = ({id}) => {
    const [error,setError] = useState<string>("");
    const [succes,setSucces] = useState<boolean>(false);
    const [editing,setEditing] = useState<boolean>(false);

    const [gameId,setId] = useState<number>(0);
    const [gameName,setName] = useState<string>("");
    const [gameGenre,setGenre] = useState<string>("");
    const [players,setPlayers] = useState<string>("");
    const [gameLogotip,setLogo] = useState<string>("");

    const submit = async (e : React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        setError("");
        setSucces(false);
        setEditing(true);

        const gamePlayers = Number(players);

        const res = await gameApi.update(gameId,{gameName,gameGenre,gamePlayers,gameLogotip});
        
        setEditing(false);
        if(!res.success) { setError(res.message ?? "Invalid values"); return;}
    
        setSucces(true);
    }

    useEffect(() => {
        gameApi.getById(Number(id))
            .then(res => {
                setName(res.data?.gameName ?? "");
                setGenre(res.data?.gameGenre ?? "");
                setLogo(res.data?.gameLogotip ?? "");
                const gamePlayers = res.data?.gamePlayers ?? 0;
                setPlayers(String(gamePlayers));
                setId(res.data?.gameId ?? 0);
            })
            .catch(() => setError("Failed to load game"))
    },[id])

    return(
        <div className="w-full max-w-sm">
            {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
            </div>
            )}
            {succes && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully edited game
                </div>
            )}
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-medium">ID: {gameId}</label>
                </div>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-medium">Name</label>
                    <input type="text" value={gameName} onChange={e => setName(e.target.value)} placeholder="game_name"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-medium">Logo</label>
                    <input type="file" accept="image/*"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if(!file) { setLogo(""); return;}

                        const reader = new FileReader();

                        reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setLogo(base64String);
                        }

                        reader.readAsDataURL(file);
                    }}
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    {gameLogotip && 
                    <img src={gameLogotip} className="mt-2 w-24 h-24 object-cover rounded-lg"/>}
                </div>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-medium">Genre</label>
                    <input type="text" value={gameGenre} onChange={e => setGenre(e.target.value)} placeholder="game_genre"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-medium">Player count</label>
                    <input type="number" value={players} onChange={e => setPlayers(e.target.value)} placeholder="player_count"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <button type="submit" disabled={editing}
                    className="mt-2 bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                    {editing ? "Editing..." : "Edit"}
                </button>
            </form>
        </div>
    );
}