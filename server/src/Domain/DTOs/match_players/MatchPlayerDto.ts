
export class MatchPlayerDto{
    constructor(
        public gamerTag : string = "",
        public userId : number = 0,
        public teamId : number = 0,
        public matchId : number = 0,
        public performanceNotes : string = "",
    ) {}
}