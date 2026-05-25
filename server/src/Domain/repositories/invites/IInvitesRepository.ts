import { TeamInviteStatus } from "../../enums/TeamInviteStatus";
import { Invite } from "../../models/TeamInvite";

export interface IInvitesRepository{
    findByUserId(userId: number) : Promise<Invite[]>;
    findByTeamId(teamId: number) : Promise<Invite[]>;
    find(teamId: number, userId: number) : Promise<Invite>;
    create(invite: Invite) : Promise<Invite>;
    delete( teamId: number,userId: number) : Promise<boolean>
    update(teamId: number, userId: number, status: TeamInviteStatus): Promise<boolean>;
}