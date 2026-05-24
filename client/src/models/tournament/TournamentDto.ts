import type { TournamentFormat } from "../../types/tournament/TournamentFormat"
import type { TournamentStatus } from "../../types/tournament/TournamentStatus"

export type TournamentDto = {
    tournamentId : number,
    tournamentName : string,
    tournamentGame : string,
    tournamentFormat : TournamentFormat,
    tournamentMaxTeams : number,
    tournamentApplicationDeadline : Date,
    tournamentPrizeFund : number,
    tournamentStatus : TournamentStatus
}