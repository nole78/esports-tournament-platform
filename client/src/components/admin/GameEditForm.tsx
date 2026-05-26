import { useEffect, useState } from "react";
import { gameApi } from "../../api_services/game_catalog/GameAPIService";
import { useNavigate } from "react-router-dom";

export const GameEditForm: React.FC<{id: string }> = ({id}) => {
    const [error,setError] = useState<string>("");
    const [success,setSucces] = useState<boolean>(false);
    const [editing,setEditing] = useState<boolean>(false);

    const [gameId,setId] = useState<number>(0);
    const [gameName,setName] = useState<string>("");
    const [gameGenre,setGenre] = useState<string>("");
    const [players,setPlayers] = useState<string>("");
    const [gameLogotip,setLogo] = useState<string>("");
    const navigate = useNavigate();

    const openFilePicker = () => {
        const element = document.getElementById("game-logo-input");

        if(!(element instanceof HTMLInputElement)) {
            return;
        }

        element.click();
    }

    const submit = async (e : React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        setError("");
        setSucces(false);
        setEditing(true);

        const gamePlayers = Number(players);

        if(!gameName || gameName.trim().length === 0 || gameName.length < 3)
        {
            setError("Game name is mandatory, and must be at least 3 characters long");
            setEditing(false);
            return;
        }

        if(!gameGenre || gameGenre.trim().length === 0|| gameGenre.length < 3)
        {
            setError("Game genre is mandatory, and must be at least 3 characters long");
            setEditing(false);
            return;
        }

        if(!gamePlayers || gamePlayers <= 0)
        {
            setError("Number of players must be above 0");
            setEditing(false);
            return;
        }

        const res = await gameApi.update(gameId,{gameName,gameGenre,gamePlayers,gameLogotip});
        
        setEditing(false);
        if(!res.success) { setError(res.message ?? "Invalid values"); return;}
    
        setSucces(true);
    }

    useEffect(() => {
        gameApi.getById(Number(id))
            .then(res => {
                if(!res.success || !res.data) {
                    setError(res.message ?? "Couldn't load game");
                    return;
                }
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
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl px-4 text-sm transition-colors"
            >
               {"<- " + "Back"}
            </button>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-bgsecondary">Game Editor</h1>
                <p className="text-sm text-secondary mt-1">Edit game fields</p>
            </div>
            {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
            </div>
            )}
            {success && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully edited game
                </div>
            )}
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs text-bgprimary mb-2 font-medium">Name</label>
                    <input type="text" value={gameName} onChange={e => setName(e.target.value)} placeholder="game_name"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                </div>
                <div>
                    <label className="mr-5 text-xs text-bgprimary mb-2 font-medium">Logo</label>
                    <button type="button" className=" rounded-xl w-1/3 py-3 border-bgprimary bg-bgprimary text-primary font-semibold text-sm hover:bg-bgprimary/80 cursor-pointer"
                        onClick={openFilePicker}
                        >Choose Image</button>
                    <input id="game-logo-input" type="file" accept="image/*"
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
                    className="w-full hidden bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    {gameLogotip && 
                    <img src={gameLogotip} className="mt-2 w-full aspect-4/3 object-cover rounded-lg"/>}
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
                <div className="flex gap-2">
                    <button type="submit" disabled={editing}
                        className="w-1/2 bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                        {editing ? "Editing..." : "Edit"}
                    </button>
                    <button type="button" onClick={() => navigate("/game_catalog")}
                        className="py-3 bg-red-400/40  cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl w-1/2 text-sm transition-colors">
                    Cancel</button>
                </div>
            </form>
        </div>
    );
}