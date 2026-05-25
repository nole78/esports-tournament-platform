
import type { MatchDto } from "../../models/match/MatchDto";
import { useNavigate } from "react-router-dom";

export function MatchNode({ match }: { match: MatchDto }) {
    const blueWon = match.winnerTeamId === match.blueTeamId && match.winnerTeamId !== 0;
    const redWon = match.winnerTeamId === match.redTeamId && match.winnerTeamId !== 0;
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/match/${match.matchId}`);
    };

    return (
        <div
            className="w-45 h-18 rounded-xl border-2 border-bgprimary/60 bg-bgprimary/20 shadow-lg overflow-hidden flex flex-col justify-center cursor-pointer hover:scale-105 transition-transform"
            onClick={handleClick}
            title="View match details"
        >
            {/* Blue team */}
            <div
                className={`flex items-center justify-between px-3 h-1/2 border-b border-bgprimary/40 ${
                    blueWon ? "bg-green-900/40" : redWon ? "bg-red-950/40" : ""}`
                }>
                <span
                    className={`text-sm font-bold truncate leading-none max-w-30 
                        ${blueWon? "text-green-400" : redWon? "text-red-500" : "text-blue-400"}`
                }>
                    {match.blueTeamName}
                </span>
                <span
                    className={`text-2xl font-black leading-none ${
                        blueWon ? "text-green-300" : redWon ? "text-red-500/70" : "text-bgsecondary"}`
                }>
                    {match.blueTeamScore}
                </span>
            </div>
            {/* Red team */}
            <div
                className={`flex items-center justify-between px-3 h-1/2 
                    ${redWon ? "bg-green-900/40" : blueWon ? "bg-red-950/40" : ""}`
                }>
                <span
                    className={`text-sm font-bold truncate leading-none max-w-30 
                        ${redWon? "text-green-400" : blueWon? "text-red-500" : "text-red-400"}`
                }>
                    {match.redTeamName}
                </span>
                <span
                    className={`text-2xl font-black leading-none 
                        ${redWon ? "text-green-300" : blueWon ? "text-red-500/70" : "text-bgsecondary"}`
                }>
                    {match.redTeamScore}
                </span>
            </div>
        </div>
    );
}