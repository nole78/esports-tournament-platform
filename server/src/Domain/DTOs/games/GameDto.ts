// Should be allright, need to check

export class GameDto{
    constructor(
        public gameName : string = "",
        public gameLogotip : string = "",
        public gameGenre : string = "",
        public gamePlayers: number = 0,
    ){}
}