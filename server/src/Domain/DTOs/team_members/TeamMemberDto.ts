import { publicDecrypt } from "node:crypto";
import { TeamRole } from '../../enums/TeamRole';

export class TeamMemberDto{
    constructor(
        public teamId: number = 0,
        public userId: number = 0,
        public role : TeamRole = TeamRole.MEMBER
    ){}
}