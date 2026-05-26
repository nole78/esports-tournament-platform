import { TournamentFormat } from "../../enums/TournamentFormat";
import { TournamentStatus } from "../../enums/TournamentStatus";

export class TournamentFilterDto{
    constructor(
            public tournamentGame : string,
            public tournamentFormat : TournamentFormat,
            public tournamentStatus : TournamentStatus
        ){}
}