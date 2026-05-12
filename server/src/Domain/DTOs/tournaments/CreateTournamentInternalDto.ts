import { TournamentFormat } from '../../enums/TournamentFormat';
import { TournamentStatus } from "../../enums/TournamentStatus"

export class CreateTournamentInternalDto {
    constructor(
        public tournamentName: string = "",
        public tournamentGameId: number = 0,
        public tournamentFormat: TournamentFormat = TournamentFormat.SINGLE_ELIMINATION,
        public tournamentMaxTeams: number = 0,
        public tournamentApplicationDeadline: string = "",
        public tournamentPrizeFund: number = 0,
        public tournamentStatus: TournamentStatus = TournamentStatus.UPCOMING,
    ) {}
}
