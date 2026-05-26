export class  CreateTournamentRegistrationDto{
    constructor(
        public teamId: number = 0,
        public tournamentId: number = 0,
    ){}
}