import { TournamentFormat } from "../../enums/TournamentFormat";
import { TournamentStatus } from "../../enums/TournamentStatus";

export class TournamentFilterDto{
    constructor(
            public tournamentGame : string|undefined,
            public tournamentFormat : TournamentFormat|undefined,
            public tournamentStatus : TournamentStatus|undefined
        ){}
}