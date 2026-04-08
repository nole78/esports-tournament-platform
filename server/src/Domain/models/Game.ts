//TODO: implement entity game

export class Game{
    constructor(
        public gameId : number = 0,
        public gameName : string = "",
        public gameLogotip : string = "",
        public gameGenre : string = "",
        public gamePlayers: number = 0,
    ){}
}