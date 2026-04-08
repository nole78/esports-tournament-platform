//TODO: implement entity match_player

export class MatchPlayer{
    constructor(
        public userId : number = 0,
        public teamId : number = 0,
        public matchId : number = 0,
        public preformaceNotes : string = "",
    ){}
}