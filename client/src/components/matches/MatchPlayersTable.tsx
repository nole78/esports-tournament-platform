import type { MatchPlayerDto } from "../../models/match_player/AddPlayerResponseDto";

type MatchPlayersTableProps = {
    leftPlayers: MatchPlayerDto[];
    rightPlayers: MatchPlayerDto[];
    onPlayerClick: (player: MatchPlayerDto) => void;
    onNotesClick: (player: MatchPlayerDto) => void;
};

export function MatchPlayersTable({
    leftPlayers,
    rightPlayers,
    onPlayerClick,
    onNotesClick,
}: MatchPlayersTableProps) {
    const renderPlayer = (player: MatchPlayerDto) => (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onPlayerClick(player)}
                className="cursor-pointer flex-1 rounded-lg bg-primary/40 px-3 py-2 text-left text-bgsecondary transition-colors hover:bg-primary/20"
            >
                <span className="font-semibold">{player.gamerTag}</span>
            </button>
            <button
                type="button"
                onClick={() => onNotesClick(player)}
                className="cursor-pointer rounded-lg bg-bgsecondary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-bgsecondary/90"
            >
                Notes
            </button>
        </div>
    );

    return (
        <div className="mx-auto mt-8 w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-bgprimary/60">
            <div className="grid grid-cols-2">
                <div className="border-r border-white/10 p-4">
                    <h3 className="mb-2 text-center text-xl font-bold text-blue-400">Left Team Lineup</h3>
                    <ul className="space-y-2">
                        {leftPlayers.map((player) => (
                            <li key={player.userId}>{renderPlayer(player)}</li>
                        ))}
                    </ul>
                </div>
                <div className="p-4">
                    <h3 className="mb-2 text-center text-xl font-bold text-red-400">Right Team Lineup</h3>
                    <ul className="space-y-2">
                        {rightPlayers.map((player) => (
                            <li key={player.userId}>{renderPlayer(player)}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
