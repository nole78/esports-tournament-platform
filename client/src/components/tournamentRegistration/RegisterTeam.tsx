import { useEffect, useState } from "react";
import { ErrorBox, PageHeader, Spinner } from "../ui/UI";
import { teamApi } from "../../api_services/teams/TeamAPIService";
import { tournamentRegistrationApi } from "../../api_services/tournament_registration/TournamentRegistrationAPIService";
import { tournamentApi } from "../../api_services/tournament_list/TournamentAPIService";
import { useParams } from "react-router-dom";
import type { TeamDto } from "../../models/team/TeamDto";
import type { TournamentDto } from "../../models/tournament/TournamentDto";
import { TournamentStatus } from "../../types/tournament/TournamentStatus";

export default function RegisterTeam() {
  const { id } = useParams();
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [unregistering, setUnregistering] = useState<boolean>(false);
  
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setError("Please select a team");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await tournamentRegistrationApi.registerTournament(Number(id), { teamId: Number(selectedTeamId), tournamentId: Number(id) });
      if (res.success) {
        setSuccess("Team successfully registered for the tournament!");
        setSelectedTeamId("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.message ?? "Failed to register team");
      }
    } catch (err) {
      setError("Failed to register team: " + err);
    } finally {
      setSubmitting(false);
    }
  }

  const unregister = async () => {
    if (!selectedTeamId) {
      setError("Please select a team");
      return;
    }

    setUnregistering(true);
    setError("");
    setSuccess("");

    try {
      const res = await tournamentRegistrationApi.delete(Number(id), Number(selectedTeamId));
      if (res.success) {
        setSuccess("Team registration successfully removed!");
        setSelectedTeamId("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.message ?? "Failed to unregister team");
      }
    } catch (err) {
      setError("Failed to unregister team: " + err);
    } finally {
      setUnregistering(false);
    }
  }
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const myTeams = await teamApi.getMyTeams();
        if (myTeams.success && myTeams.data) {
          setTeams(myTeams.data);
        } else {
          setError("Failed to load teams");
        }

        const tournamentData = await tournamentApi.getById(Number(id));
        if (tournamentData.success && tournamentData.data) {
          setTournament(tournamentData.data);
        }
      } catch (err) {
        setError("Failed to load data! " + err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      <PageHeader eyebrow="" title="Register/Remove your team" />
      {error && <ErrorBox message={error} />}
      {success && (
        <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 mb-4">
          <p className="text-green-400 font-medium">{success}</p>
        </div>
      )}
      {loading ? (
        <div className="max-w-2xl text-center py-12">
          <p className="text-white/60">Loading teams...</p>
          <Spinner />
        </div>
      ) : teams.length === 0 ? (
        <div className="max-w-2xl bg-primary border border-secondary/40 rounded-xl p-6 text-center">
          <p className="text-white/80 text-lg">You don't have any teams to register for this tournament.</p>
          <p className="text-white/60 text-sm mt-2">Create a team first and make sure you are the captain.</p>
        </div>
      ) : (
        <div className="max-w-2xl">
          <form onSubmit={submit} className="bg-primary border border-secondary/40 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Select one of your teams</label>
              <select 
                value={selectedTeamId} 
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={submitting}
                className="bg-bgprimary/10 border w-full border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50">
                <option value="" className='bg-lime-950'>
                    Select a team
                </option>
                {teams.map(team => (
                    <option className='bg-lime-950' key={team.teamId} value={team.teamId}>
                        {team.teamName}
                    </option>
                ))}
              </select>
            </div>

            {selectedTeamId && teams.find(t => t.teamId === Number(selectedTeamId)) && (
              <div className="bg-bgprimary/30 border border-secondary/30 rounded-lg p-4 mt-4 space-y-3">
                {(() => {
                  const selectedTeam = teams.find(t => t.teamId === Number(selectedTeamId));
                  return (
                    <>
                      {selectedTeam?.teamLogotip && (
                        <div className="flex justify-center mb-3">
                          <img 
                            src={selectedTeam.teamLogotip} 
                            alt={selectedTeam.teamName} 
                            className="h-16 w-16 rounded-lg object-cover" 
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Team Name</p>
                        <p className="text-white font-semibold">{selectedTeam?.teamName}</p>
                      </div>
                      {selectedTeam?.teamTag && (
                        <div>
                          <p className="text-xs text-white/60 uppercase tracking-wide">Team Tag</p>
                          <p className="text-white font-mono">{selectedTeam.teamTag}</p>
                        </div>
                      )}
                      {selectedTeam?.teamDescription && (
                        <div>
                          <p className="text-xs text-white/60 uppercase tracking-wide">Description</p>
                          <p className="text-white/80 text-sm">{selectedTeam.teamDescription}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            {selectedTeamId && tournament && tournament.tournamentStatus !== TournamentStatus.ACTIVE && tournament.tournamentStatus !== TournamentStatus.COMPLETED && (
              <>
                <button 
                  type="submit"
                  disabled={submitting || !selectedTeamId}
                  className="w-full bg-linear-to-r from-[#f7d494] to-[#d2aa60] text-[#41542b] font-medium py-2 rounded-lg hover:shadow-lg hover:shadow-blue-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "Registering..." : "Register team"}
                </button>
              
                <button 
                  type="button"
                  onClick={unregister}
                  disabled={unregistering || !selectedTeamId}
                  className="w-full bg-red-600/80 hover:bg-red-600 text-white font-medium py-2 rounded-lg hover:shadow-lg hover:shadow-red-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {unregistering ? "Removing..." : "Remove registration"}
                </button>
              </>
            )}

            {selectedTeamId && tournament && (tournament.tournamentStatus === TournamentStatus.ACTIVE || tournament.tournamentStatus === TournamentStatus.COMPLETED) && (
              <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4 text-center">
                <p className="text-red-400 font-medium">Can't register or remove teams if tournament already started!</p>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}