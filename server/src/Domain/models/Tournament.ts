//TODO: implement entity tournament

import { TournamentFormat } from "../enums/TournamentFormat";
import { TournamentStatus } from "../enums/TournamentStatus";

export class Tournament{
    constructor(
        public tournamentId : number = 0,
        public tournamentName : string = "",
        public tournamentGameId : number = 0,
        public tournamentFormat : TournamentFormat = TournamentFormat.SINGLE_ELIMINATION,
        public tournamentMaxTeams : number = 0,
        public tournamentApplicationDeadline : Date = new Date(),
        public tournamentPrizeFund : number = 0,
        public tournamentStatus : TournamentStatus = TournamentStatus.UPCOMING,
    ){}
}