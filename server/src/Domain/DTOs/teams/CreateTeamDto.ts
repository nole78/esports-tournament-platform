// TODO: implement creation of team DTO

export class CreateTeamDto{
    constructor(
        public teamName : string = "",
        public teamTag : string = "",
        public teamLogotip : string = "",
        public teamDescription : string = "",
    ){}
}