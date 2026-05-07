import { TournamentFormat } from "../../enums/TournamentFormat";
import { TournamentStatus } from "../../enums/TournamentStatus";

export class TournamentDto{
    constructor(
            public tournamentName : string = "",
            public tournamentGame : string = "",
            public tournamentFormat : TournamentFormat = TournamentFormat.SINGLE_ELIMINATION,
            public tournamentMaxTeams : number = 0,
            public tournamentApplicationDeadline : Date = new Date(),
            public tournamentPrizeFund : number = 0,
            public torunamentStatus : TournamentStatus = TournamentStatus.UPCOMING,
        ){}
}