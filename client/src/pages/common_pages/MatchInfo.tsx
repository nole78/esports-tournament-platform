import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { MatchDetails } from "../../components/matches/MatchDetails";
import { MatchPlayersTable } from "../../components/matches/MatchPlayersTable";
import { MatchResult } from "../../components/matches/MatchResult";
import { matchApi } from "../../api_services/matches/MatchAPIService";
import UserOverview from "../user/UserOverview";
import type { MatchDetailsDto } from "../../models/match/MatchDetailsDto";
import type { MatchPlayerDto } from "../../models/match_player/AddPlayerResponseDto";
import { useParams } from "react-router-dom";
import MatchLineup from '../../components/matches/MatchLineup';
import { teamApi } from "../../api_services/teams/TeamAPIService";
import { Spinner } from '../../components/ui/UI';

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

export default function TestPage() {
    const matchId = Number(useParams());
    const { user } = useAuth();
    const [matchState, setMatchState] = useState<MatchState>({ status: "loading" });
    const [players, setPlayers] = useState<PlayersState>({ left: [], right: [] });
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [showLineup, setShowLineup] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerOverlayState>({ status: "closed" });
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
                    left: blue.success && blue.data ? blue.data : [],
                    right: red.success && red.data ? red.data : [],
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
    }, [matchId, matchState]);

    const handleResultSuccess = () => {
        setShowResult(false);
        setRefreshKey((value) => value + 1);
    };

    const canEditLineup = isBlueCaptain || isRedCaptain;
    const lineupTeamId =
        matchState.status === "loaded"
            ? isRedCaptain
                ? matchState.match.redTeamId
                : matchState.match.blueTeamId
            : 0;

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto relative">
                <MatchDetails id={matchId} key={refreshKey} />

                {user && user.role === "admin" && matchState.status === "loaded" && matchState.match.status === "ongoing" && (
                    <div className="absolute right-4 top-4 z-10 flex gap-3">
                        <button
                            type="button"
                            className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/80"
                            onClick={() => setShowResult(true)}
                        >
                            Set Result
                        </button>
                    </div>
                )}

                {showResult && matchState.status === "loaded" && (
                    <MatchResult
                        matchId={matchState.match.matchId}
                        initialBlue={matchState.match.blueTeamScore}
                        initialRed={matchState.match.redTeamScore}
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
                            className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/20"
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
                        onPlayerClick={(player) =>
                            setSelectedPlayer({ status: "open", userId: player.userId })
                        }
                    />
                )}
            </div>

            {showLineup && matchState.status === "loaded" && canEditLineup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-bgprimary/95 p-4 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-bgsecondary">Match Lineup</h2>
                            <button
                                type="button"
                                className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white transition-colors hover:bg-white/20"
                                onClick={() => setShowLineup(false)}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-bgprimary/95 p-4 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-bgsecondary">Player Overview</h2>
                            <button
                                type="button"
                                className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white transition-colors hover:bg-white/20"
                                onClick={() => setSelectedPlayer({ status: "closed" })}
                            >
                                Close
                            </button>
                        </div>
                        <UserOverview userId={selectedPlayer.userId} />
                    </div>
                </div>
            )}
        </div>
    );
}
