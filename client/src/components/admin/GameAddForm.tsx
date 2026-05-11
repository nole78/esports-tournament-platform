import { useRef, useState } from "react";
import type { IGameAPIService } from "../../api_services/game_catalog/IGameAPIService";
import { useNavigate } from "react-router-dom";


export default function GameAddForm({gameApi} : {gameApi:IGameAPIService}){

    const [gameName,setName] = useState<string>("");
    const [gameLogotip,setLogo] = useState<string>("");
    const [gameGenre,setGenre] = useState<string>("");
    const [players,setPlayers] = useState<string>("");

    const [error,setError] = useState<string>("");
    const [preview,setPreview] = useState<string>("");
    const [succes,setSucces] = useState<boolean>(false);
    const [creating,setCreating] = useState<boolean>(false);

    const fileRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

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
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-bgsecondary">Game Adder</h1>
                <p className="text-sm text-secondary mt-1">Add new game</p>
            </div>

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
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Name</label>
                    <input type="text" value={gameName} onChange={e => setName(e.target.value)} placeholder="game_name"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div>
                    <label className="mr-5 w-min text-xs text-bgprimary mb-2 font-bold">Logo</label>
                    <button type="button" className=" rounded-xl w-1/3 py-3 border-bgprimary bg-bgprimary text-primary font-semibold text-sm hover:bg-bgprimary/80 cursor-pointer"
                        onClick={() => {if(fileRef.current) fileRef.current.click()}}
                        >Choose Image</button>
                    <input type="file" accept="image/*" ref={fileRef}
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
                    className="hidden w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    {preview && 
                    <img src={preview} className="mt-2 w-full aspect-4/3 object-cover rounded-lg"/>}
                </div>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Genre</label>
                    <input type="text" value={gameGenre} onChange={e => setGenre(e.target.value)} placeholder="game_genre"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-bold">Player Count</label>
                    <input type="number" value={players} onChange={e => setPlayers(e.target.value)} placeholder="player_count"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div className="flex gap-2">
                    <button type="submit" disabled={creating}
                        className="w-1/2 cursor-pointer bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                        {creating ? "Creating…" : "Create"}
                    </button>
                    <button type="button" onClick={() => navigate("/game_catalog")}
                        className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-1/2 text-sm transition-colors">
                    Cancel</button>
                </div>
            </form>
        </div>
    );
}