export class UserWatchlistDto{
    constructor(
        public userId : number = 0,
        public tournamentId : number = 0,
        public addedAt : Date = new Date(),
    ){}
}