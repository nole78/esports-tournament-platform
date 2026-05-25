import { useEffect, useState } from "react";
import { matchApi } from "../../api_services/matches/MatchAPIService";
import { tournamentApi } from "../../api_services/tournament_list/TournamentAPIService";
import { gameApi } from "../../api_services/game_catalog/GameAPIService";
import { teamApi } from "../../api_services/teams/TeamAPIService";

import { Empty, ErrorBox, Spinner } from "../ui/UI";
import placeholder  from  "../../assets/placeholder.png"
import type { MatchDetailState } from "../../types/matches/MatchDetailsState";

export function MatchDetails({id,}: {id: number;}) {
    const [state, setState] =
        useState<MatchDetailState>({
            loading: true,
            error: "",
            match: null,
            blueTeam: null,
            redTeam: null,
            tournament: "",
            game: "",
        });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setState((s) => ({
                    ...s,
                    loading: true,
                    error: "",
                }));

                const matchRes =
                    await matchApi.getDetails(id);

                if (!matchRes.success || !matchRes.data) {
                    throw new Error(
                        matchRes.message,
                    );
                }

                const match = matchRes.data;

                const [ tournamentRes, blueRes, redRes] = await Promise.all([
                    tournamentApi.getById(match.tournamentId),
                    teamApi.getById( match.blueTeamId),
                    teamApi.getById(match.redTeamId),
                ]);

                let game = "";

                if (tournamentRes.success && tournamentRes.data) {
                    const gameRes = await gameApi.getAll(1, 100);

                    if (gameRes.success && gameRes.data) {
                        game = gameRes.data.items.find((g) => g.gameName ===tournamentRes.data?.tournamentGame)?.gameName ?? "";
                    }
                }

                if (cancelled) return;

                setState({
                    loading: false,
                    error: "",
                    match,
                    blueTeam: blueRes.success? (blueRes.data? blueRes.data : null) : null,
                    redTeam: redRes.success? (redRes.data? redRes.data : null) : null,
                    tournament: tournamentRes.success? tournamentRes.data?.tournamentName ?? "" : "",
                    game,
                });
            } catch {
                if (cancelled) return;

                setState((s) => ({
                    ...s,
                    loading: false,
                    error:"Failed to load match",
                }));
            }
        }
        load();
        return () => {cancelled = true;};
    }, [id]);

    if (state.loading)
        return (
            <div className="flex justify-center py-16">
                <Spinner size={24} />
            </div>
        );

    if (state.error && !state.match)
        return (
            <ErrorBox message={state.error} />
        );

    if (!state.match)
        return (
            <Empty message="Match not found" />
        );

    return (
        <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-white/10 bg-bgprimary/30">
            <div className="p-5 bg-primary/90 flex flex-col gap-6"> 
                <div className="flex items-start justify-between">

                    <div className="text-sm font-semibold text-bgprimary">
                        #{state.match.matchId}
                    </div>

                    <div className="text-center">
                        <p className="text-3xl font-bold text-bgsecondary leading-none">
                            {state.tournament}
                        </p>

                        <p className="text-sm text-bgsecondary/70 mt-1">
                            {state.game}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-bgsecondary/60">
                            ROUND
                        </p>

                        <p className="text-2xl font-bold text-bgsecondary">
                            {state.match.roundNumber}
                        </p>
                    </div>
                </div>

                <div className="flex items-end justify-between">

                {state.match.status === "completed" && 
                        <p className="text-5xl font-bold text-bgsecondary leading-none">
                            <span className="text-blue-400">{state.match.blueTeamScore}</span> : <span className="text-red-400">{state.match.redTeamScore}</span>
                        </p>
                }
                {state.match.status !== "completed" && 
                        <p className="text-5xl font-bold text-bgsecondary leading-none">
                            - : -
                        </p>
                }


                    <p className="text-2xl font-extrabold uppercase text-bgprimary">
                        {state.match.status}
                    </p>
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 p-5 text-center border-r border-white/10">
                        <img    src={state.blueTeam?.teamLogotip ?? placeholder}
                                alt=""
                                draggable={false}
                                className="w-16 h-16 rounded-xl mx-auto mb-2"
                        />

                    <p className="text-blue-400 font-bold">
                        {state.blueTeam?.teamName ??  state.match.blueTeamName}
                    </p>

                    <p className="text-sm text-bgsecondary/80">
                        {state.blueTeam?.teamTag}
                    </p>
                </div>
                <div className="flex-1 p-5 text-center">
                        <img    src={state.redTeam?.teamLogotip ?? placeholder}
                                alt=""
                                draggable={false}
                                className="w-16 h-16 rounded-xl mx-auto mb-2"
                        />

                    <p className="text-red-400 font-bold">
                        {state.redTeam?.teamName ?? state.match.redTeamName}
                    </p>

                    <p className="text-sm text-bgsecondary/80">
                        {state.redTeam?.teamTag}
                    </p>
                </div>
            </div>
        </div>
    );
}