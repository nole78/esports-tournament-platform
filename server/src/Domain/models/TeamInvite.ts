import { TeamInviteStatus } from "../enums/TeamInviteStatus";

export class Invite{
    constructor(
        public userId : number = 0,
        public teamId : number = 0,
        public invitedAt : Date = new Date(),
        public status : TeamInviteStatus = TeamInviteStatus.PENDING 
    ){}
};