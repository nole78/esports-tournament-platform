import { TournamentFormat } from "../../enums/TournamentFormat";
import { TournamentStatus } from "../../enums/TournamentStatus";

export class TournamentFilterInternalDto{
    constructor(
            public tournamentGameId : number|undefined,
            public tournamentFormat : TournamentFormat|undefined,
            public tournamentStatus : TournamentStatus|undefined
        ){}
}