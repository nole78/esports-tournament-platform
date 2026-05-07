
export class CreateGameDto{
    public constructor(
        public gameName: string         = "",
        public gameLogotip: string         = "",
        public gameGenre: string        = "",
        public gamePlayers: number    = 0
    ){}
}
