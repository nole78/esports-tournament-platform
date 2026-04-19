// TODO: implement class for Game DTO

export class GameDto{
    constructor(
        public gameId: number      = 0, 
        public name: string        = "", 
        public logo: string        = "", 
        public genre: string       = "", 
        public playerCnt: number   = 0
    ){}
}