import { TournamentRegistrationStatus } from "../../enums/TournamentRegistrationStatus";

export class TournamentRegistrationDto{
    constructor(
        public teamId : number = 0,
        public teamName : string = "",
        public teamTag : string = "",
        public teamLogotip : string = "",
        public tournamentId : number = 0,
        public tournamentName : string = "",
        public seed : number = 0,
        public status : TournamentRegistrationStatus = TournamentRegistrationStatus.PENDING
    ){}
}