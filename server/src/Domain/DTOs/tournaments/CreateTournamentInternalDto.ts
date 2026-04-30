import { TournamentFormat } from '../../enums/TournamentFormat';
import { TournamentStatus } from "../../enums/TournamentStatus"

/**
 * Internal DTO which Repository expects - Game ID already found
 * Only in Service→Repository comunication
 */
export class CreateTournamentInternalDto {
    constructor(
        public tournamentName: string = "",
        public tournamentGameId: number = 0,
        public tournamentFormat: TournamentFormat = TournamentFormat.SINGLE_ELIMINATION,
        public tournamentMaxTeams: number = 0,
        public tournamentApplicationDeadline: Date = new Date(),
        public tournamentPrizeFund: number = 0,
        public tournamentStatus: TournamentStatus = TournamentStatus.UPCOMING,
    ) {}
}
