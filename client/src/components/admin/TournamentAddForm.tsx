import { useState, useEffect } from 'react';
import type { ITournamentAPIService } from '../../api_services/tournament_list/ITournamentAPIService';
import { TournamentFormatValues, type TournamentFormat } from '../../types/tournament/TournamentFormat';
import { TournamentStatusValues, type TournamentStatus } from '../../types/tournament/TournamentStatus';
import type { IGameAPIService } from '../../api_services/game_catalog/IGameAPIService';
import type { GameDto } from '../../models/game/GameDto';


export default function TournamentAddForm({tournamentApi, gameApi} : {tournamentApi:ITournamentAPIService, gameApi:IGameAPIService}){
    const [tournamentName,setTournamentName] = useState<string>("");
    const [gameName,setGameName] = useState<string>("");
    const [format,setFormat] = useState<TournamentFormat>('single_elimination');
    const [maxTeams, setMaxTeams] = useState<string>("");
    const [applicationDeadline, setApplicationDeadline] = useState<Date>(new Date());
    const [prizeFund, setPrizeFund] = useState<string>("");
    const [status, setStatus] = useState<TournamentStatus>('upcoming');
    const [games, setGames] = useState<GameDto[]>([]);

    const [error, setError] = useState<string>("");
    const [succes, setSucces] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);
    
    useEffect(() => {
        gameApi.getAll()
        .then(res => {
            if (res.success) {
                setGames(res.data?.items ?? []);
                setError("");
            } else {
                setError(res.message ?? "Failed to load games");
                setGames([]);
            } 
        })
        .catch(() => setError("Failed to load games!"));
    }, [gameApi]);
    
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSucces(false);
        setCreating(true);

    const maxTeamsNum = Number(maxTeams);
    const prizeFundNum = Number(prizeFund);

    const payload = {
        tournamentName, 
        tournamentGame: gameName, 
        tournamentFormat: format, 
        tournamentMaxTeams: maxTeamsNum, 
        tournamentApplicationDeadline: applicationDeadline, 
        tournamentPrizeFund: prizeFundNum, 
        tournamentStatus: status
    };
    
    const res = await tournamentApi.create(payload);
    
    setCreating(false);
    if(!res.success || !res.data) {setError(res.message ?? "Invalid values"); return;}
    
    setSucces(true);
    setTournamentName("");
    setGameName("");
    setFormat('single_elimination');
    setMaxTeams("");
    setApplicationDeadline(new Date());
    setPrizeFund("");
    setStatus('upcoming');
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
                        Succesfully added tournament
                    </div>
                )}
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-bgprimary mb-2 font-medium">Tournament name</label>
                        <input type="text" value={tournamentName} onChange={e => setTournamentName(e.target.value)} placeholder="tournament_name"
                        className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    </div>
                    <div>
                        <label className="block text-xs text-bgprimary mb-2 font-medium">Game name</label>
                        <select 
                            value={gameName} 
                            onChange={e => setGameName(e.target.value)}
                            className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50">
                            {games.map(game => (
                                <option className='bg-lime-950' key={game.gameId} value={game.gameName}>
                                    {game.gameName}
                                </option>
                            ))}
                        </select>    
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-2">
                            <label className="block text-xs text-bgprimary mb-2 font-medium">Format</label>
                            <select 
                                value={format} 
                                onChange={e => setFormat(e.target.value as TournamentFormat)}
                                className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors">
                                {Object.entries(TournamentFormatValues).map(([key, value]) => (
                                    <option className='bg-lime-950' key={key} value={value}>
                                        {key.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1.5">
                            <label className="block text-xs text-bgprimary mb-2 font-medium">Status</label>
                            <select 
                                value={status} 
                                onChange={e => setStatus(e.target.value as TournamentStatus)}
                                className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors"
                            >
                                {Object.entries(TournamentStatusValues).map(([key, value]) => (
                                    <option className='bg-lime-950' key={key} value={value}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-bgprimary mb-2 font-medium">Maximum number of teams</label>
                        <input type="number" value={maxTeams} onChange={e => setMaxTeams(e.target.value)} placeholder="max_teams"
                        className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    </div>
                    <div>
                        <label className="block text-xs text-bgprimary mb-2 font-medium">Prize fund</label>
                        <input type="number" value={prizeFund} onChange={e => setPrizeFund(e.target.value)} placeholder="prizeFund"
                        className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"/>
                    </div>
                    <div>
                        <label className="block text-xs text-bgprimary mb-2 font-medium">Application deadline</label>
                        <input type='date' value={applicationDeadline.toISOString().split('T')[0]}onChange={e => setApplicationDeadline(new Date(e.target.value))}className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors" style={{colorScheme: "dark"}}/>
                    </div>
                    <button type="submit" disabled={creating}
                        className="mt-2 bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
                        {creating ? "Creating…" : "Create"}
                    </button>
                </form>
            </div>
        );
}