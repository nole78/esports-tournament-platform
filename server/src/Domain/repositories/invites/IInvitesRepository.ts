import { Invite } from "../../models/Invite";

export interface IInvitesRepository{
    findByUserId(userId: number) : Promise<Invite[]>;
    findByTeamId(teamId: number) : Promise<Invite[]>;
    create(invite: Invite) : Promise<Invite>;
    delete(userId: number, teamId: number) : Promise<boolean>
}