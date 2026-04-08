//TODO: implement entity tournament_registration

import { TournamentRegistrationStatus } from "../enums/TournamentRegistrationStatus";

export class TournamentRegistration{
    constructor(
        public teamId : number = 0,
        public tournamentId : number = 0,
        public seed : number = 0,
        public status : TournamentRegistrationStatus = TournamentRegistrationStatus.PENDING,
        public registeredAt : Date = new Date(),
    ){}
}