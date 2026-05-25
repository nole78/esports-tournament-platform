import { Invite } from "../../models/TeamInvite";

export interface IInvitesRepositoryRead{
    findByUserId(userId: number) : Promise<Invite[]>;
    findByTeamId(teamId: number) : Promise<Invite[]>;
    find(teamId: number, userId: number) : Promise<Invite>;
    
}