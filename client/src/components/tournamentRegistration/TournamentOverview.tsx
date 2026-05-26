import { useParams } from "react-router-dom";
import { PageHeader, Spinner, ErrorBox } from "../ui/UI";
import { useEffect, useState } from "react";
import { tournamentApi } from "../../api_services/tournament_list/TournamentAPIService";
import type { TournamentDto } from "../../models/tournament/TournamentDto";
import { formatDeadline } from "../../helpers/date_formatter";
import { tournamentRegistrationApi } from "../../api_services/tournament_registration/TournamentRegistrationAPIService";
import { matchApi } from "../../api_services/matches/MatchAPIService";
import Bracket from "../matches/Bracket";
import type { MatchDto } from "../../models/match/MatchDto";
import { TournamentFormat } from "../../types/tournament/TournamentFormat";
import RoundRobin from "../matches/RoundRobin";
import DoubleBracket from "../matches/DoubleBracket";

export default function TournamentOverview() {
    
    const {id} = useParams();
    const [tournament, setTournament] = useState<TournamentDto>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [bracketError, setBracketError] = useState<string>("");
    const [generatingBracket, setGeneratingBracket] = useState(false);
    const [matches, setMatches] = useState<MatchDto[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    useEffect(() => {
        Promise.resolve().then(() => setLoading(true));
        tournamentApi.getById(Number(id))
        .then(res => {
          if (res.success && res.data) {
            setTournament(res.data);
          }
          else
          {
            setError(res.message);
          }
        })
        .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (tournament && tournament.tournamentStatus !== 'upcoming') {
            setLoadingMatches(true);
            matchApi.getAllForTorunament(Number(id))
            .then(res => {
                if (res.success && res.data) {
                    setMatches(res.data);
                } else {
                    setError("Error while loading matches "+res.message);
                }
            })
            .catch(() => setError('Failed to load matches'))
            .finally(() => setLoadingMatches(false));
        }
    }, [tournament, id]);

    const handleGenerateBracket = async () => {
        setGeneratingBracket(true);
        setBracketError("");
        try {
            
            const response = await tournamentRegistrationApi.generateBracket(Number(id));
            if(response.success)
            {
                //load page again
                setTimeout(() => {
                    tournamentApi.getById(Number(id))
                    .then(res => {
                        if (res.success && res.data) {
                            setTournament(res.data);
                        }
                    })
                    .catch(() => setBracketError("Failed to reload tournament"));
                }, 1000);
            }
            else
            {
                setBracketError("Generating bracket failed!");
                setTimeout(() => setBracketError(""), 5000);
            }
        } catch (err) {
            setBracketError('Failed to generate bracket: ' + err);
            setTimeout(() => setBracketError(""), 5000);
        } finally {
            setGeneratingBracket(false);
        }
    };

    return (
        <div>
            <PageHeader eyebrow="" title="Tournament Overview" />
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner />
                    </div>
                ) : error ? (
                    <ErrorBox message={error} />
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

                {tournament && tournament.tournamentStatus === 'upcoming' && (
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
                        {loadingMatches ? (
                            <div className="flex justify-center py-8">
                                <Spinner />
                            </div>
                        ) : matches.length > 0 ? (
                            tournament.tournamentFormat === TournamentFormat.SINGLE_ELIMINATION ?
                            <Bracket matches={matches} title={`${tournament.tournamentName} - ${tournament.tournamentFormat}`} />:
                            tournament.tournamentFormat === TournamentFormat.ROUND_ROBIN?
                            <RoundRobin matches={matches} />:
                            <DoubleBracket matches={matches} />
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