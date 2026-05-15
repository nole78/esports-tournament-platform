// Should be allright, need to check

import { TeamRole } from "../../enums/TeamRole";

export class TeamDto{
    constructor(
        public teamId: number = 0, 
        public teamName : string = "",
        public teamTag : string = "",
        public teamLogotip : string = "",
        public teamDescription : string = "",
        public userRole : TeamRole = TeamRole.MEMBER
    ){}
}