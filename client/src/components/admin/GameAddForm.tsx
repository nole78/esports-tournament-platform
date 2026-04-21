import { useState } from "react";
import type { IGameAPIService } from "../../api_services/game_catalog/IGameAPIService";



export default function GameAddForm({gameApi} : {gameApi:IGameAPIService}){

    const [gameName,setName] = useState<string>("");
    const [gameLogotip,setLogo] = useState<string>("");
    const [gameGenre,setGenre] = useState<string>("");
    const [players,setPlayers] = useState<string>("");

    const [error,setError] = useState<string>("");
    const [preview,setPreview] = useState<string>("");
    const [succes,setSucces] = useState<boolean>(false);
    const [creating,setCreating] = useState<boolean>(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSucces(false);
    setCreating(true);
    const gamePlayers = Number(players);

    const res = await gameApi.create({gameName,gameLogotip,gameGenre,gamePlayers});
    
    setCreating(false);
    if(!res.success || !res.data) {setError(res.message ?? "Invalid values"); return;}
    
    setSucces(true);
    setName("");
    setGenre("");
    setLogo("");
    setPlayers("");
    setPreview("");
  };
    return(
        <div className="w-full max-w-sm">
            {error && (
                <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}
            {succes && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully added game
                </div>
            )}
            <form onSubmit={submit} className="flex flex-col gap-4">
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
                        if(!file) { setLogo("");setPreview(""); return;}

                        const reader = new FileReader();

                        reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setLogo(base64String);
                            setPreview(base64String);
                        }

                        reader.readAsDataURL(file);
                    }}
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    {preview && 
                    <img src={preview} className="mt-2 w-24 h-24 object-cover rounded-lg"/>}
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
                <button type="submit" disabled={creating}
                    className="mt-2 bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                    {creating ? "Creating…" : "Create"}
                </button>
            </form>
        </div>
    );
}