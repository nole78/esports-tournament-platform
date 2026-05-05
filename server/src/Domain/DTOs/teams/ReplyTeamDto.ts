import { TeamRole } from "../../enums/TeamRole";

export class ReplyTeamDto{
    constructor(
        public teamId: number = 0, 
        public teamName : string = "",
        public teamTag : string = "",
        public teamLogotip : string = "",
        public teamDescription : string = "",
        public teamMemberRole : TeamRole = TeamRole.MEMBER,
        public teamUserFullName : string = "",
        public teamUserTag : string = ""
    ){}
}