import { useParams } from "react-router-dom";
import { PageHeader, Spinner, ErrorBox } from "../ui/UI";
import { useState } from "react";
import { tournamentApi } from "../../api_services/tournament_list/TournamentAPIService";
import { formatDeadline } from "../../helpers/date_formatter";
import { tournamentRegistrationApi } from "../../api_services/tournament_registration/TournamentRegistrationAPIService";
import { matchApi } from "../../api_services/matches/MatchAPIService";
import Bracket from "../matches/Bracket";
import { TournamentFormat } from "../../types/tournament/TournamentFormat";
import RoundRobin from "../matches/RoundRobin";
import DoubleBracket from "../matches/DoubleBracket";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useQuery, keepPreviousData, useQueryClient} from "@tanstack/react-query";

export default function TournamentOverview() {
    
    const {id} = useParams();
    const [bracketError, setBracketError] = useState<string>("");
    const [generatingBracket, setGeneratingBracket] = useState(false);
    const {user} = useAuth();
    const queryClinet = useQueryClient();

    const { data: tournamentData, isLoading: loading, error} = useQuery({
        queryKey: ["tournament"],
        queryFn: async () => {
            return tournamentApi.getById(Number(id))
            .then(res => {
                if (!res.success) {
                    throw new Error(res.message ?? "Failed to get tournament info");
                }
                return res.data;
            })
            .catch(() => { throw new Error("Failed to get torunament info")})
        },
        placeholderData: keepPreviousData
    })

    const {data: matchesData, isLoading: loadingMatches, error: matchesError} = useQuery({
        queryKey: ["matches"],
        queryFn: async () => {
                return matchApi.getAllForTorunament(Number(id))
                .then(res => {
                    if (!res.success) {
                        throw new Error(res.message || "Error while loading matches ");
                    }
                    return res.data;
                })
                .catch(() => { throw new Error('Failed to load matches')})
        },
        placeholderData: keepPreviousData
    })

    const tournament = tournamentData
    const matches = matchesData || [];

    const handleGenerateBracket = async () => {
        setGeneratingBracket(true);
        setBracketError("");    
        tournamentRegistrationApi.generateBracket(Number(id))
        .then(res => {
            if(!res.success) {
                setBracketError("Generating bracket failed!");
                setTimeout(() => setBracketError(""), 5000);
            }
            queryClinet.invalidateQueries({queryKey: ["tournament"]});
        })
        .catch(() => {
            setBracketError('Failed to generate bracket: ');
            setTimeout(() => setBracketError(""), 5000);
        })
        .finally (() => {setGeneratingBracket(false)})
    }


    return (
        <div>
            <PageHeader eyebrow="" title="Tournament Overview" />
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner />
                    </div>
                ) : error ? (
                    <ErrorBox message={error.message} />
                ) : tournament ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Main Info */}
                        <div className="bg-primary border border-secondary/40 rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">{tournament.tournamentName}</h2>
                            
                            <div className="space-y-4">
                                <div className="border-b border-secondary/20 pb-3">
                                    <p className="text-xs text-white/50 uppercase tracking-wide">Game</p>
                                    <p className="text-lg font-semibold text-white">{tournament.tournamentGame}</p>
                                </div>
                                
                                <div className="border-b border-secondary/20 pb-3">
                                    <p className="text-xs text-white/50 uppercase tracking-wide">Format</p>
                                    <p className="text-lg font-semibold text-white capitalize">{tournament.tournamentFormat}</p>
                                </div>
                                
                                <div className="border-b border-secondary/20 pb-3">
                                    <p className="text-xs text-white/50 uppercase tracking-wide">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                                        tournament.tournamentStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                                        tournament.tournamentStatus === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {tournament.tournamentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-primary border border-secondary/40 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6">Details</h3>
                            
                            <div className="space-y-4">
                                <div className="border-b border-secondary/20 pb-3">
                                    <p className="text-xs text-white/50 uppercase tracking-wide">Max Teams</p>
                                    <p className="text-2xl font-bold text-white">{tournament.tournamentMaxTeams}</p>
                                </div>
                                
                                <div className="border-b border-secondary/20 pb-3">
                                    <p className="text-xs text-white/50 uppercase tracking-wide">Prize Fund</p>
                                    <p className="text-xl font-semibold text-white">
                                        ${tournament.tournamentPrizeFund?.toLocaleString() || 'TBA'}
                                    </p>
                                </div>
                                
                                <div className="border-b border-secondary/20 pb-3">
                                    <p className="text-xs text-white/50 uppercase tracking-wide">Application Deadline</p>
                                    <p className="text-sm text-white">{formatDeadline(tournament.tournamentApplicationDeadline)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-primary border border-secondary/40 rounded-xl p-6 text-center">
                        <p className="text-white/50">Tournament not found</p>
                    </div>
                )}

                {tournament && tournament.tournamentStatus === 'upcoming' && user?.role === "admin" &&(
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <button
                            onClick={handleGenerateBracket}
                            disabled={generatingBracket}
                            className="px-8 py-3 bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30 text-green-400 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {generatingBracket ? 'Generating Bracket...' : 'Generate Bracket'}
                        </button>
                        {bracketError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
                                {bracketError}
                            </div>
                        )}
                    </div>
                )}

                {tournament && tournament.tournamentStatus !== 'upcoming' && (
                    <div className="mt-8">
                        {matchesError ? (
                            <ErrorBox message={matchesError.message}/>
                        ) :
                        loadingMatches ? (
                            <div className="flex justify-center py-8">
                                <Spinner />
                            </div>
                        ) : matches && matches.length > 0 ? (
                            tournament.tournamentFormat === TournamentFormat.SINGLE_ELIMINATION ? (
                                <Bracket matches={matches} title={`${tournament.tournamentName} - ${tournament.tournamentFormat}`} />
                            ) :
                            tournament.tournamentFormat === TournamentFormat.ROUND_ROBIN ? (
                                <RoundRobin matches={matches} />
                            ) : (
                                <DoubleBracket matches={matches} />
                            )
                        ) : (
                            <div className="bg-primary border border-secondary/40 rounded-xl p-6 text-center">
                                <p className="text-white/50">No matches available yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {}
        </div>
    );
}