import { Result } from "../../common/Result"
import { InviteDto } from "../../DTOs/invite/InviteDto"
import { UserDto } from "../../DTOs/users/UserDto"

export  interface ITeamMemberService{
    invite(gamerTag: string, teamId: number, gamerTagInvite: string) : Promise<Result<InviteDto>>
    inviteResponse(gamerTag: string, team_id: number, response: string) : Promise<Result<void>>
    transferCaptainship(gamerTagCaptain: string, teamId: number, reciverId : number) : Promise<Result<void>>
    leaveTeam(gamerTagInitializer: string, teamId: number, userId: number) : Promise<Result<void>>

    getTeamMembers(teamId:number) : Promise<Result<UserDto[]>>
    getInvites(gamerTag: string) : Promise<Result<InviteDto[]>>
    
}