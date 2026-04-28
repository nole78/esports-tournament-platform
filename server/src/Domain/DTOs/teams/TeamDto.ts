// Should be allright, need to check

export class TeamDto{
    constructor(
        public teamId: number = 0, 
        public teamName : string = "",
        public teamTag : string = "",
        public teamLogotip : string = "",
        public teamDescription : string = "",
    ){}
}