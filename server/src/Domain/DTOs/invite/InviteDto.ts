import { TeamInviteStatus } from "../../enums/TeamInviteStatus";

export class InviteDto{
    constructor(
        public userId : number = 0,
        public teamId : number = 0,
        public inivtedAt : Date = new Date(),
        public status : TeamInviteStatus = TeamInviteStatus.PENDING, 
    ){}
};