import type { TournamentFormat } from "../../types/tournament/TournamentFormat"
import type { TournamentStatus } from "../../types/tournament/TournamentStatus"

export type TournamentFilterDto = {
    tournamentGame : string|undefined,
    tournamentFormat : TournamentFormat|undefined,
    tournamentStatus : TournamentStatus|undefined
}