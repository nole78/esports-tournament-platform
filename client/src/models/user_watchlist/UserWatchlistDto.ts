import type { TournamentStatus } from "../../types/tournament/TournamentStatus"
export type UserWatchlistDto = {
    userId: number,
    tournamentId: number,
    tournamentName: string,
    tournamentStatus: TournamentStatus,
    gameName: string,
    gameLogotip: string,
    addedAt: Date
}