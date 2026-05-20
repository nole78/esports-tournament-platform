import { TournamentStatus } from "../../enums/TournamentStatus";

export class UserWatchlistDto{
    constructor(
        public userId : number = 0,
        public tournamentId : number = 0,
        public tournamentName : string = "",
        public tournamentStatus : TournamentStatus = TournamentStatus.UPCOMING,
        public gameName : string = "",
        public gameLogotip : string = "",
        public addedAt : Date = new Date(),
    ){}
}