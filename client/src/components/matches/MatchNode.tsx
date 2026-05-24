import type { MatchDto } from "../../models/match/MatchDto";

export function MatchNode({ match }: { match: MatchDto }) {
    const blueWon =
        match.winnerTeamId === match.blueTeamId && match.winnerTeamId !== 0;
    const redWon =
        match.winnerTeamId === match.redTeamId && match.winnerTeamId !== 0;

    return (
        <div className="w-[180px] h-[64px] rounded-xl border border-white/10 bg-[#0B1612] shadow-lg overflow-hidden flex flex-col justify-center">
            {/* Blue team */}
            <div
                className={`flex items-center justify-between px-3 h-1/2 border-b border-white/10 ${
                    blueWon ? "bg-green-900/40" : redWon ? "bg-red-950/40" : ""
                }`}
            >
                <span
                    className={`text-sm font-bold truncate leading-none max-w-[120px] ${
                        blueWon
                            ? "text-green-400"
                            : redWon
                            ? "text-red-500"
                            : "text-blue-400"
                    }`}
                >
                    {match.blueTeamName}
                </span>
                <span
                    className={`text-2xl font-black leading-none ${
                        blueWon ? "text-green-300" : redWon ? "text-red-500/70" : "text-[#E8D8A8]"
                    }`}
                >
                    {match.blueTeamScore}
                </span>
            </div>

            {/* Red team */}
            <div
                className={`flex items-center justify-between px-3 h-1/2 ${
                    redWon ? "bg-green-900/40" : blueWon ? "bg-red-950/40" : ""
                }`}
            >
                <span
                    className={`text-sm font-bold truncate leading-none max-w-[120px] ${
                        redWon
                            ? "text-green-400"
                            : blueWon
                            ? "text-red-500"
                            : "text-red-400"
                    }`}
                >
                    {match.redTeamName}
                </span>
                <span
                    className={`text-2xl font-black leading-none ${
                        redWon ? "text-green-300" : blueWon ? "text-red-500/70" : "text-[#E8D8A8]"
                    }`}
                >
                    {match.redTeamScore}
                </span>
            </div>
        </div>
    );
}