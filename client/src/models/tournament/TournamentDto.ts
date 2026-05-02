import type { TournamentFormat } from "../../types/tournament/TournamentFormat"
import type { TournamentStatus } from "../../types/tournament/TournamentStatus"

export type TournamentDto = {
    tournamentName : string,
    tournamentGame : string,
    tournamentFormat : TournamentFormat,
    tournamentMaxTeams : number,
    tournamentApplicationDeadline : Date,
    tournamentPrizeFund : number,
    torunamentStatus : TournamentStatus
}