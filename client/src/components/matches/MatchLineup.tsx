import { useEffect, useMemo, useState } from "react";
import { matchApi } from "../../api_services/matches/MatchAPIService";
import { teamApi } from "../../api_services/teams/TeamAPIService";
import type { MatchPlayerDto } from "../../models/match_player/AddPlayerResponseDto";
import { ErrorBox, Spinner, SuccessBox } from "../ui/UI";
import placeholder from "../../assets/avatar_placeholder.jpg"

type RosterPlayer = {
    userId: number;
    gamerTag: string;
    profilePicture: string;
};

type FilledPlayer = {
    userId: number;
    gamerTag: string;
    locked: boolean;
};

type LineupSlot =
    | { kind: "empty" }
    | { kind: "filled"; player: FilledPlayer };

type Props = {
    matchId: number;
    teamId: number;
    playersPerTeam: number;
    disabled: boolean;
};

const DRAG_KEY = "playerId";
const REMOVING_NONE = -1;

function createEmptySlots(count: number): LineupSlot[] {
    const slots: LineupSlot[] = [];
    for (let i = 0; i < count; i++) {
        slots.push({ kind: "empty" });
    }
    return slots;
}

function mapLineupFromApi(players: MatchPlayerDto[], size: number): LineupSlot[] {
    const slots = createEmptySlots(size);
    for (let i = 0; i < players.length && i < size; i++) {
        const p = players[i];
        slots[i] = {
            kind: "filled",
            player: {
                userId: p.userId,
                gamerTag: p.gamerTag,
                locked: true,
            },
        };
    }
    return slots;
}

function getLineupUserIds(slots: LineupSlot[]): number[] {
    const ids: number[] = [];
    for (const slot of slots) {
        if (slot.kind === "filled") {
            ids.push(slot.player.userId);
        }
    }
    return ids;
}

function countFilled(slots: LineupSlot[]): number {
    let count = 0;
    for (const slot of slots) {
        if (slot.kind === "filled") {
            count++;
        }
    }
    return count;
}

function isSlotEmpty(slot: LineupSlot): boolean {
    return slot.kind === "empty";
}

export default function MatchLineup({ matchId, teamId, playersPerTeam, disabled }: Props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [roster, setRoster] = useState<RosterPlayer[]>([]);
    const [lineup, setLineup] = useState<LineupSlot[]>([]);
    const [pendingAdds, setPendingAdds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [removingIndex, setRemovingIndex] = useState(REMOVING_NONE);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError("");

            const [membersRes, lineupRes] = await Promise.all([
                teamApi.getMembers(teamId),
                matchApi.getPlayers(matchId, teamId),
            ]);

            if (!membersRes.success || !membersRes.data) {
                setError(membersRes.message || "Failed to load team members");
                setLoading(false);
                return;
            }

            if (!lineupRes.success || !lineupRes.data) {
                setError(lineupRes.message || "Failed to load match lineup");
                setLoading(false);
                return;
            }

            setRoster(
                membersRes.data.map((m) => ({
                    userId: m.id,
                    gamerTag: m.gamerTag,
                    profilePicture: m.profilePicture,
                })),
            );
            setLineup(mapLineupFromApi(lineupRes.data, playersPerTeam));
            setPendingAdds([]);
            setLoading(false);
        }
        loadData()
    }, [matchId, teamId, playersPerTeam]);

    const lineupUserIds = useMemo(() => getLineupUserIds(lineup), [lineup]);

    const availablePlayers = useMemo(
        () => roster.filter((p) => !lineupUserIds.includes(p.userId)),
        [roster, lineupUserIds],
    );

    function onDragStart(e: React.DragEvent, player: RosterPlayer) {
        if (disabled) {
            return;
        }
        e.dataTransfer.setData(DRAG_KEY, String(player.userId));
        e.dataTransfer.effectAllowed = "move";
    }

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

    function onDrop(e: React.DragEvent, slotIndex: number) {
        e.preventDefault();
        if (disabled || saving) {
            return;
        }

        const slot = lineup[slotIndex];
        if (!isSlotEmpty(slot)) {
            return;
        }

        const playerId = Number(e.dataTransfer.getData(DRAG_KEY));
        if (!playerId || lineupUserIds.includes(playerId)) {
            return;
        }

        const player = roster.find((p) => p.userId === playerId);
        if (!player) {
            return;
        }

        const next = [...lineup];
        next[slotIndex] = {
            kind: "filled",
            player: {
                userId: player.userId,
                gamerTag: player.gamerTag,
                locked: false,
            },
        };
        setLineup(next);
        if (!pendingAdds.includes(player.userId)) {
            setPendingAdds([...pendingAdds, player.userId]);
        }
        setSuccess("");
        setError("");
    }

    async function removePlayer(slotIndex: number) {
        const slot = lineup[slotIndex];
        if (slot.kind !== "filled" || disabled) {
            return;
        }

        const { player } = slot;

        if (!player.locked) {
            const next = [...lineup];
            next[slotIndex] = { kind: "empty" };
            setLineup(next);
            setPendingAdds(pendingAdds.filter((id) => id !== player.userId));
            return;
        }

        setRemovingIndex(slotIndex);
        setError("");
        setSuccess("");

        const response = await matchApi.removePlayer(matchId, player.userId);
        setRemovingIndex(REMOVING_NONE);

        if (!response.success) {
            setError(response.message || "Failed to remove player");
            return;
        }

        const next = [...lineup];
        next[slotIndex] = { kind: "empty" };
        setLineup(next);
        setSuccess("Player removed — slot unlocked");
        setTimeout(() => {
            setSuccess("");
        }, 3000);
    }

    async function submitChanges() {
        const toAdd = [...new Set(pendingAdds)];
        if (toAdd.length === 0) {
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        const response = await matchApi.addPlayers(matchId, { teamId, userIds: toAdd });
        setSaving(false);

        if (!response.success || !response.data) {
            setError(response.message || "Failed to add players");
            return;
        }

        const failedIds = new Set(response.data.failedPlayers.map((f) => f.userId));

        setLineup((prev) =>
            prev.map((slot) => {
                if (slot.kind !== "filled" || !toAdd.includes(slot.player.userId)) {
                    return slot;
                }
                if (failedIds.has(slot.player.userId)) {
                    return slot;
                }
                return {
                    kind: "filled",
                    player: { ...slot.player, locked: true },
                };
            }),
        );

        setPendingAdds(pendingAdds.filter((id) => failedIds.has(id)));

        if (response.data.failedPlayers.length > 0) {
            setError(
                response.data.failedPlayers.map((f) => `${f.userId}: ${f.reason}`).join(" · "),
            );
        } else {
            setSuccess("Lineup saved");
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        }
    }

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="flex flex-col gap-4">
            {error !== "" && <ErrorBox message={error} />}
            {success !== "" && <SuccessBox message={success} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-bgsecondary">Team Players</h2>
                        <span className="text-bgprimary text-sm">{availablePlayers.length} available</span>
                    </div>

                    <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-1">
                        {availablePlayers.map((player) => (
                            <div
                                key={player.userId}
                                draggable={!disabled && !saving}
                                onDragStart={(e) => onDragStart(e, player)}
                                className="bg-zinc-800 hover:bg-zinc-700 transition border border-zinc-700 rounded-lg p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing select-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden shrink-0">
                                    {player.profilePicture !== "" && (
                                        <img
                                            src={player.profilePicture? player.profilePicture : placeholder}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            draggable={false}
                                        />
                                    )}
                                </div>
                                <div>
                                    <span className="text-white font-semibold">{player.gamerTag}</span>
                                    <span className="block text-zinc-400 text-sm">ID: {player.userId}</span>
                                </div>
                            </div>
                        ))}

                        {availablePlayers.length === 0 && (
                            <div className="text-secondary/80 text-sm text-center py-10 border border-dashed border-secondary/80 rounded-lg">
                                No available players
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-bgsecondary">Match Lineup</h2>
                        <span className="text-bgprimary text-sm">
                            {countFilled(lineup)}/{playersPerTeam}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {lineup.map((slot, index) => (
                            <div
                                key={index}
                                onDrop={(e) => onDrop(e, index)}
                                onDragOver={isSlotEmpty(slot) ? onDragOver : () => {}}
                                className={`min-h-22 rounded-xl border-2 border-dashed p-4 flex items-center justify-between gap-3 w-full transition ${
                                    slot.kind === "filled"
                                        ? "border-secondary/50 bg-zinc-800"
                                        : "border-secondary/80 bg-zinc-900"
                                }`}
                            >
                                {slot.kind === "empty" && (
                                    <span className="text-secondary/80 text-sm select-none">
                                        Drag player here
                                    </span>
                                )}

                                {slot.kind === "filled" && (
                                    <>
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="min-w-0">
                                                <div className="text-white font-semibold truncate">
                                                    {slot.player.gamerTag}
                                                </div>
                                                <div className="text-sm text-zinc-400">
                                                    User ID: {slot.player.userId}
                                                </div>
                                            </div>
                                            <span
                                                className={`shrink-0 text-xs px-2 py-1 rounded border ${
                                                    slot.player.locked
                                                        ? "bg-green-900 text-green-300 border-green-700"
                                                        : "bg-yellow-900 text-yellow-300 border-yellow-700"
                                                }`}
                                            >
                                                {slot.player.locked ? "LOCKED" : "PENDING"}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removePlayer(index);
                                            }}
                                            disabled={
                                                disabled ||
                                                saving ||
                                                removingIndex === index
                                            }
                                            title="Remove player"
                                            className="cursor-pointer shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border-2 border-red-400 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-lg font-bold leading-none shadow-md"
                                            aria-label="Remove player"
                                        >
                                            ✕
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {!disabled && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        disabled={
                            pendingAdds.length === 0 ||
                            saving ||
                            removingIndex !== REMOVING_NONE
                        }
                        onClick={submitChanges}
                        className={`${                            
                            (pendingAdds.length === 0 || saving || removingIndex !== REMOVING_NONE)? 
                             "cursor-default" : "cursor-pointer"} 
                            px-6 py-3 rounded-xl bg-bgprimary hover:bg-bgprimary/80 disabled:bg-zinc-700 disabled:text-zinc-400 text-primary font-semibold transition`}
                    >
                        {saving ? "Saving…" : "Submit changes"}
                    </button>
                </div>
            )}
        </div>
    );
}
