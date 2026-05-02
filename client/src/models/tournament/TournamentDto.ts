import type { TournamentFormat } from "../types/TournamentFormat"
import type { TournamentStatus } from "../types/TournamentStatus"

export type TournamentDto = {
    tournamentName : string,
    tournamentGame : string,
    tournamentFormat : TournamentFormat,
    tournamentMaxTeams : number,
    tournamentApplicationDeadline : Date,
    tournamentPrizeFund : number,
    torunamentStatus : TournamentStatus
}