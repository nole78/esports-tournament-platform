import type { MatchPlayerDto } from "../../models/match_player/AddPlayerResponseDto";

type MatchPlayersTableProps = {
    leftPlayers: MatchPlayerDto[];
    rightPlayers: MatchPlayerDto[];
    onPlayerClick: (player: MatchPlayerDto) => void;
};

export function MatchPlayersTable({
    leftPlayers,
    rightPlayers,
    onPlayerClick,
}: MatchPlayersTableProps) {
    return (
        <div className="mx-auto mt-8 w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-bgprimary/60">
            <div className="grid grid-cols-2">
                <div className="border-r border-white/10 p-4">
                    <h3 className="mb-2 text-xl text-center font-bold text-blue-400">Left Team Lineup</h3>
                    <ul className="space-y-2">
                        {leftPlayers.map((player) => (
                            <li key={player.userId}>
                                <button
                                    type="button"
                                    onClick={() => onPlayerClick(player)}
                                    className="cursor-pointer text-bgsecondary w-full rounded-lg bg-primary/40 px-3 py-2 text-left transition-colors hover:bg-primary/20"
                                >
                                    <span className="font-semibold">{player.gamerTag}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4">
                    <h3 className="text-xl mb-2 text-center font-bold text-red-400">Right Team Lineup</h3>
                    <ul className="space-y-2">
                        {rightPlayers.map((player) => (
                            <li key={player.userId}>
                                <button
                                    type="button"
                                    onClick={() => onPlayerClick(player)}
                                    className="cursor-pointer w-full text-bgsecondary rounded-lg bg-primary/40 px-3 py-2 text-left transition-colors hover:bg-primary/20"
                                >
                                    <span className="font-semibold">{player.gamerTag}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
