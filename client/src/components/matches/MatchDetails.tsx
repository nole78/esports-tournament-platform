import { useEffect, useState } from "react";
import { matchApi } from "../../api_services/matches/MatchAPIService";
import { Empty, ErrorBox, Spinner } from "../ui/UI";
import placeholder from "../../assets/placeholder.png";
import type { MatchDetailsDto } from "../../models/match/MatchDetailsDto";

type MatchDetailsState =
    | { status: "loading" }
    | { status: "error"; error: string }
    | { status: "empty" }
    | { status: "success"; match: MatchDetailsDto };

export function MatchDetails({ id }: { id: number }) {
    const [state, setState] = useState<MatchDetailsState>({
        status: "loading"
    });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setState({ status: "loading" });
                const matchRes = await matchApi.getDetails(id);

                if (!matchRes.success) {
                    throw new Error(matchRes.message);
                }

                if (!matchRes.data) {
                    if (cancelled) return;

                    setState({ status: "empty" });
                    return;
                }

                if (cancelled) return;
                setState({status: "success", match: matchRes.data });
            } catch {
                if (cancelled) return;
                setState({status: "error", error: "Failed to load match"});
            }
        }
        load();
        return () => {cancelled = true;};
    }, [id]);

    if (state.status === "loading") {
        return (
            <div className="flex justify-center py-16">
                <Spinner size={24} />
            </div>
        );
    }

    if (state.status === "error") {
        return <ErrorBox message={state.error} />;
    }

    if (state.status === "empty") {
        return <Empty message="Match not found" />;
    }

    const match = state.match;


    return (
        <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-white/10 bg-bgprimary/30">
            <div className="p-5 bg-primary/90 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold text-bgprimary">
                        #{match.matchId}
                    </div>

                    <div className="text-center">
                        <p className="text-3xl font-bold text-bgsecondary leading-none">
                            {match.tournamentName}
                        </p>

                        <p className="text-sm text-bgsecondary/70 mt-1">
                            {match.gameName}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-bgsecondary/60">
                            ROUND
                        </p>

                        <p className="text-2xl font-bold text-bgsecondary">
                            {match.roundNumber}
                        </p>
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    {match.status === "completed" ? (
                        <p className="text-5xl font-bold text-bgsecondary leading-none">
                            <span className="text-blue-400">
                                {match.blueTeamScore}
                            </span>
                            {" : "}
                            <span className="text-red-400">
                                {match.redTeamScore}
                            </span>
                        </p>
                    ) : (
                        <p className="text-5xl font-bold text-bgsecondary leading-none">
                            - : -
                        </p>
                    )}

                    <p className="text-2xl font-extrabold uppercase text-bgprimary">
                        {match.status}
                    </p>
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 p-5 text-center border-r border-white/10">
                    <img
                        src={match.blueTeamLogo || placeholder}
                        alt=""
                        draggable={false}
                        className="w-16 h-16 rounded-xl mx-auto mb-2"
                    />

                    <p className="text-blue-400 font-bold">
                        {match.blueTeamName}
                    </p>

                    <p className="text-sm text-bgsecondary/80">
                        {match.blueTeamTag}
                    </p>
                </div>

                <div className="flex-1 p-5 text-center">
                    <img
                        src={match.redTeamLogo || placeholder}
                        alt=""
                        draggable={false}
                        className="w-16 h-16 rounded-xl mx-auto mb-2"
                    />

                    <p className="text-red-400 font-bold">
                        {match.redTeamName}
                    </p>

                    <p className="text-sm text-bgsecondary/80">
                        {match.redTeamTag}
                    </p>
                </div>
            </div>
        </div>
    );
}