export class GuestTeamDto{
    constructor(
        public teamId: number = 0, 
        public teamName : string = "",
        public teamTag : string = "",
        public teamLogotip : string = "",
        public teamDescription : string = "",
        //TODO maybe add the team members here
    ){}
}