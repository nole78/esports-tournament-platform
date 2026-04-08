// TODO: implement class for Game DTO creation

export class CreateGameDto{
    constructor(
        public gameName : string = "",
        public gameLogotip : string = "",
        public gameGenre : string = "",
        public gamePlayers: number = 0,
    ){}
}
