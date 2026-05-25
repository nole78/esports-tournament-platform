import { TeamInviteStatus } from "../../enums/TeamInviteStatus";
import { Invite } from "../../models/TeamInvite";

export interface IInvitesRepositoryWrite{
    create(invite: Invite) : Promise<Invite>;
    delete( teamId: number,userId: number) : Promise<boolean>
    update(teamId: number, userId: number, status: TeamInviteStatus): Promise<boolean>;
}