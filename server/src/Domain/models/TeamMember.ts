import { TeamRole } from '../enums/TeamRole';

export class TeamMember{
    constructor(
        public teamId : number = 0,
        public userId : number = 0,
        public role : TeamRole = TeamRole.MEMBER,
        public joinedAt : Date = new Date(),
    ){}
}