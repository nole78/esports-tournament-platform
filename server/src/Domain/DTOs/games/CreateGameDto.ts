// TODO: implement class for Game DTO creation

export class CreateGameDto{
    public constructor(
        public name: string         = "",
        public logo: string         = "",
        public genre: string        = "",
        public playerCnt: number    = 0
    ){}
}