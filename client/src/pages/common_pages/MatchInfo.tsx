import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { MatchDetails } from "../../components/matches/MatchDetails";
import { MatchPlayersTable } from "../../components/matches/MatchPlayersTable";
import { MatchResult } from "../../components/matches/MatchResult";
import { matchApi } from "../../api_services/matches/MatchAPIService";
import UserOverview from "../../components/account/UserOverview";
import type { MatchDetailsDto } from "../../models/match/MatchDetailsDto";
import type { MatchPlayerDto } from "../../models/match_player/AddPlayerResponseDto";
import { useParams } from "react-router-dom";
import MatchLineup from '../../components/matches/MatchLineup';
import { teamApi } from "../../api_services/teams/TeamAPIService";
import { Spinner } from '../../components/ui/UI';
import { PerformanceNotes } from "../../components/matches/PerformanceNotes";

type MatchState =
    | { status: "loading" }
    | { status: "error"; error: string }
    | { status: "loaded"; match: MatchDetailsDto };

type PlayersState = {
    left: MatchPlayerDto[];
    right: MatchPlayerDto[];
};

type PlayerOverlayState =
    | { status: "closed" }
    | { status: "open"; userId: number };

const emptyPlayer: MatchPlayerDto = {
    gamerTag: "",
    userId: 0,
    teamId: 0,
    matchId: 0,
    performanceNotes: "",
};

export default function MatchInfo() {
    const {id} = useParams();
    const matchId = Number(id);

    const navigate = useNavigate();
    const { user } = useAuth();
    const [matchState, setMatchState] = useState<MatchState>({ status: "loading" });
    const [players, setPlayers] = useState<PlayersState>({ left: [], right: [] });
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [showLineup, setShowLineup] = useState(false);
    const [lineupReloadKey, setLineupReloadKey] = useState(0);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerOverlayState>({ status: "closed" });
    const [selectedNotesPlayer, setSelectedNotesPlayer] = useState<MatchPlayerDto>(emptyPlayer);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isBlueCaptain, setIsBlueCaptain] = useState(false);
    const [isRedCaptain, setIsRedCaptain] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function checkCaptain() {
            if (matchState.status !== "loaded" || !user) {
                setIsBlueCaptain(false);
                setIsRedCaptain(false);
                return;
            }

            setIsBlueCaptain(false);
            setIsRedCaptain(false);

            try {
                const [blueRes, redRes] = await Promise.all([
                    teamApi.getCaptain(matchState.match.blueTeamId),
                    teamApi.getCaptain(matchState.match.redTeamId),
                ]);

                if (cancelled) {
                    return;
                }

                setIsBlueCaptain(Boolean(blueRes.success && blueRes.data && blueRes.data.id === user.id));
                setIsRedCaptain(Boolean(redRes.success && redRes.data && redRes.data.id === user.id));
            } catch {
                if (!cancelled) {
                    setIsBlueCaptain(false);
                    setIsRedCaptain(false);
                }
            }
        }

        checkCaptain();

        return () => {
            cancelled = true;
        };
    }, [matchState, user]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setMatchState({ status: "loading" });
            const res = await matchApi.getDetails(matchId);

            if (cancelled) {
                return;
            }

            if (!res.success) {
                setMatchState({ status: "error", error: res.message || "Failed to load match" });
                return;
            }

            if (!res.data) {
                setMatchState({ status: "error", error: "Failed to load match" });
                return;
            }

            setMatchState({ status: "loaded", match: res.data });
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [matchId, refreshKey]);

    useEffect(() => {
        if (matchState.status !== "loaded") {
            return;
        }

        const currentMatch = matchState.match;
        let cancelled = false;

        async function loadPlayers() {
            setLoadingPlayers(true);

            try {
                const [blue, red] = await Promise.all([
                    matchApi.getPlayers(matchId, currentMatch.blueTeamId),
                    matchApi.getPlayers(matchId, currentMatch.redTeamId),
                ]);

                if (cancelled) {
                    return;
                }

                setPlayers({
                    left: blue.success && blue.data ? blue.data.map(normalizePlayer) : [],
                    right: red.success && red.data ? red.data.map(normalizePlayer) : [],
                });
            } catch {
                if (!cancelled) {
                    setPlayers({ left: [], right: [] });
                }
            } finally {
                if (!cancelled) {
                    setLoadingPlayers(false);
                }
            }
        }

        loadPlayers();

        return () => {
            cancelled = true;
        };
    }, [matchId, matchState, lineupReloadKey]);

    const handleResultSuccess = () => {
        setShowResult(false);
        setRefreshKey((value) => value + 1);
    };

    const closeLineup = () => {
        setShowLineup(false);
        setLineupReloadKey((value) => value + 1);
    };

    const normalizePlayer = (player: MatchPlayerDto): MatchPlayerDto => ({
        ...player,
        performanceNotes: typeof player.performanceNotes === "string" ? player.performanceNotes : "",
    });

    const updatePlayerNotes = (userId: number, performanceNotes: string) => {
        setPlayers((current) => ({
            left: current.left.map((player) =>
                player.userId === userId ? { ...player, performanceNotes } : player,
            ),
            right: current.right.map((player) =>
                player.userId === userId ? { ...player, performanceNotes } : player,
            ),
        }));
    };

    useEffect(() => {
        const shouldLockScroll = showLineup || selectedPlayer.status === "open" || isNotesOpen;

        document.body.style.overflow = shouldLockScroll ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [showLineup, selectedPlayer.status, isNotesOpen]);

    const canEditLineup = isBlueCaptain || isRedCaptain;
    const lineupTeamId =
        matchState.status === "loaded"
            ? isRedCaptain
                ? matchState.match.redTeamId
                : matchState.match.blueTeamId
            : 0;

    const isCaptainForSelectedPlayer =
        matchState.status === "loaded"
            ? (isBlueCaptain && selectedNotesPlayer.teamId === matchState.match.blueTeamId) ||
              (isRedCaptain && selectedNotesPlayer.teamId === matchState.match.redTeamId)
            : false;

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto relative">
                <div className="mb-2 w-full right-4 top-4 z-10 flex items-center justify-between gap-3">
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="py-3 bg-red-400/40 cursor-pointer border-red-500 hover:bg-red-400/30 hover:border-bgsecondary/70 text-red-500 font-semibold rounded-xl px-4 text-sm transition-colors"
                        >
                            Back
                        </button>
                    </div>
                    {user && user.role === "admin" && matchState.status === "loaded" && matchState.match.status !== "completed" && (
                        <div>
                            <button
                                type="button"
                                className="cursor-pointer rounded-lg bg-bgsecondary/30 px-4 py-2 font-semibold border-bgsecondary border-2 text-bgsecondary transition-colors hover:bg-bgsecondary/20"
                                onClick={() => setShowResult(true)}
                            >
                                Set Result
                            </button>
                        </div>
                    )}
                </div>
                <MatchDetails id={matchId} key={refreshKey} />


                {showResult && matchState.status === "loaded" && (
                    <MatchResult
                        matchId={matchState.match.matchId}
                        initialBlue={matchState.match.blueTeamScore ?? 0}
                        initialRed={matchState.match.redTeamScore ?? 0}
                        onClose={() => setShowResult(false)}
                        onSuccess={handleResultSuccess}
                    />
                )}
            </div>


            <div className="mx-auto mt-8 max-w-3xl">
                <div>
                    {canEditLineup && (
                        <button
                            type="button"
                            className="cursor-pointer rounded-lg bg-bgprimary px-4 py-2 font-semibold text-primary transition-colors hover:bg-bgprimary/80"
                            onClick={() => setShowLineup(true)}
                        >
                            Edit Lineup
                        </button>
                    )}
                </div>
                {loadingPlayers ? (
                    <div className="flex justify-center py-8">
                        <Spinner size={24} />
                    </div>
                ) : (
                    <MatchPlayersTable
                        leftPlayers={players.left}
                        rightPlayers={players.right}
                        onPlayerClick={(player) => {
                            setIsNotesOpen(false);
                            setSelectedPlayer({ status: "open", userId: player.userId });
                        }}
                        onNotesClick={(player) => {
                            setSelectedPlayer({ status: "closed" });
                            setSelectedNotesPlayer(player);
                            setIsNotesOpen(true);
                        }}
                    />
                )}
            </div>

            {showLineup && matchState.status === "loaded" && canEditLineup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onClick={closeLineup}
                >
                    <div
                        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-secondary/90 p-4 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-bgsecondary">Match Lineup</h2>
                            <button
                                type="button"
                                className="cursor-pointer rounded-lg bg-bgprimary px-3 py-1 text-sm text-primary transition-colors hover:bg-bgprimary/60"
                                onClick={closeLineup}
                            >
                                Close
                            </button>
                        </div>
                        <MatchLineup
                            matchId={matchState.match.matchId}
                            teamId={lineupTeamId}
                            playersPerTeam={matchState.match.playersPerTeam}
                            disabled={false}
                        />
                    </div>
                </div>
            )}

            {selectedPlayer.status === "open" && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedPlayer({ status: "closed" })}
                >
                    <div
                        className="relative w-full max-w-2xl rounded-2xl border bg-secondary/90 p-4 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-bgsecondary">Player Overview</h2>
                            <button
                                type="button"
                                className="cursor-pointer rounded-lg bg-bgprimary px-3 py-1 text-sm text-primary transition-colors hover:bg-bgprimary/60"
                                onClick={() => setSelectedPlayer({ status: "closed" })}
                            >
                                Close
                            </button>
                        </div>
                        <UserOverview id={selectedPlayer.userId} />
                    </div>
                </div>
            )}

            {isNotesOpen && (
                <PerformanceNotes
                    matchId={matchId}
                    playerId={selectedNotesPlayer.userId}
                    playerName={selectedNotesPlayer.gamerTag}
                    performanceNotes={selectedNotesPlayer.performanceNotes}
                    isCaptain={isCaptainForSelectedPlayer}
                    onClose={() => setIsNotesOpen(false)}
                    onSaved={(performanceNotes) => updatePlayerNotes(selectedNotesPlayer.userId, performanceNotes)}
                />
            )}
        </div>
    );
}
