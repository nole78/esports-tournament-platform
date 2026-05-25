export class CreateUserWatchlistDto{
    public constructor(
        public userId : number = 0,
        public tournamentId : number = 0,
    ){}
}
