import { ErrorType } from "../../Domain/common/ErrorType";
import { Result } from "../../Domain/common/Result";
import { InviteDto } from "../../Domain/DTOs/invite/InviteDto";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { TeamInviteStatus } from "../../Domain/enums/TeamInviteStatus";
import { TeamRole } from "../../Domain/enums/TeamRole";
import { Invite } from "../../Domain/models/TeamInvite";
import { TeamMember } from "../../Domain/models/TeamMember";
import { IInvitesRepositoryRead } from "../../Domain/repositories/invites/IInvitesRepositoryRead";
import { IInvitesRepositoryWrite } from "../../Domain/repositories/invites/IInvitesRepositoryWrite";
import { ITeamMemberRepositoryRead } from "../../Domain/repositories/team_members/ITeamMemberRepositoryRead";
import { ITeamMemberRepositoryWrite } from "../../Domain/repositories/team_members/ITeamMemberRepositoryWrite";
import { ITeamRepositoryRead } from "../../Domain/repositories/teams/ITeamRepositoryRead";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { ITeamMemberService } from "../../Domain/services/teamMember/ITeamMemberService";

export class TeamMemberService implements ITeamMemberService{
    public constructor(
                           private readonly teamRepoRead: ITeamRepositoryRead,
                           private readonly teamMemberRepoWrite: ITeamMemberRepositoryWrite,
                           private readonly teamMemberRepoRead: ITeamMemberRepositoryRead,
                           private readonly userRepo: IUserRepository,
                           private readonly inviteRepoWrite: IInvitesRepositoryWrite,
                           private readonly inviteRepoRead: IInvitesRepositoryRead
    ){}
    async invite(gamerTag: string, teamId: number, gamerTag_invite: string): Promise<Result<InviteDto>> {
    
            const userSender = await this.userRepo.findByUsername(gamerTag);
            if (userSender.id === 0){
                return Result.Failure(`User with ${gamerTag} doesn't exist`, ErrorType.NotFound);
            }
    
            const team = await this.teamRepoRead.findById(teamId);
            if (team.teamId === 0){
                return Result.Failure(`Team with ${teamId} doesn't exist`, ErrorType.NotFound);
            }
    
            const members = await this.teamMemberRepoRead.findByTeamId(teamId);
            const isCaptain = members.some((x) => (x.role === TeamRole.CAPTAIN) && userSender.id === x.userId);
            if (!isCaptain){
                return Result.Failure(`Sender of the invite is not a captain`, ErrorType.Unauthorized);
            }
    
            const userForInvite = await this.userRepo.findByUsername(gamerTag_invite);
            if (userForInvite.id === 0){
                return Result.Failure(`User with ${gamerTag_invite} doesn't exist`, ErrorType.NotFound);
            }
    
            if (userForInvite.id === userSender.id){
                return Result.Failure(`User can't invite himself`, ErrorType.Conflict);
            }
    
            const inTeam = members.some((x) => (x.userId === userForInvite.id));
            if (inTeam){
                 return Result.Failure(`User is allready in this team`, ErrorType.Conflict);
            }

            const result = await this.inviteRepoWrite.create(new Invite(userForInvite.id as number, team.teamId as number));
            if (result.teamId===0 || result.userId===0){
                 return Result.Failure(`Can't create invite`, ErrorType.Internal);
            }
            return Result.Success(new InviteDto(result.userId, result.teamId, result.invitedAt, result.status));
        }
    
    
        async inviteResponse(gamerTag: string, teamId: number, answer: string): Promise<Result<void>> {
            
            const userResponder = await this.userRepo.findByUsername(gamerTag);
            if (userResponder.id === 0){
                return Result.Failure(`User with ${gamerTag} username doesn't exist`, ErrorType.NotFound);
            }
    
            const team = await this.teamRepoRead.findById(teamId);
            if (team.teamId === 0){
                return Result.Failure(`Team with ${teamId} team id doesn't exist`, ErrorType.NotFound);
            }
    
            if ((await this.inviteRepoRead.find(team.teamId, userResponder.id)).status !== TeamInviteStatus.PENDING){
                return Result.Failure(`Status is not pending`, ErrorType.Conflict);
            }
    
            if (answer === "YES"){
                
                const result = await this.inviteRepoWrite.update(team.teamId, userResponder.id, TeamInviteStatus.ACCEPTED);
                if (!result){
                    return Result.Failure(`Couldn't update status to accpeted`, ErrorType.Internal);
                }
    
                const memberAdd = new TeamMember(team.teamId, userResponder.id, TeamRole.MEMBER);
                const member = await this.teamMemberRepoWrite.create(memberAdd);
                const res = !!member && member.userId === memberAdd.userId && member.teamId === memberAdd.teamId
                && member.role === memberAdd.role ;
    
                return res ? Result.Success() : Result.Failure(`Couldn't add member to the team`, ErrorType.Internal);
    
            }
    
            if(answer === "NO"){
                const result = await this.inviteRepoWrite.update(team.teamId, userResponder.id, TeamInviteStatus.REJECTED);
                if (!result){
                    return Result.Failure(`Couldn't update status to rejected`, ErrorType.Internal);
                }
                return Result.Success();
            }
            
    
            return Result.Failure(`Failed to handle response`, ErrorType.Internal);
        }
    
    
        async transferCaptainship(gamerTagCaptain: string, teamId: number, reciverId: number): Promise<Result<void>> {
            const transferUser = await this.userRepo.findByUsername(gamerTagCaptain);
            if (transferUser.id === 0){
                return Result.Failure(`User with ${gamerTagCaptain} username doesn't exist`, ErrorType.NotFound);
            }
    
            const reciveUser = await this.userRepo.findById(reciverId);
            if (reciveUser.id === 0){
                return Result.Failure(`User with ${reciverId} id doesn't exist`, ErrorType.NotFound);
            }
    
            const team = await this.teamRepoRead.findById(teamId);
            if (team.teamId === 0){
                return Result.Failure(`Team with ${teamId} team id doesn't exist`, ErrorType.NotFound);
            }
    
             const members = await this.teamMemberRepoRead.findByTeamId(team.teamId);
            
             const memberT = members.find(x => x.userId === transferUser.id);
    
             const memberR = members.find(x => x.userId === reciveUser.id);
             if ( memberT?.role === TeamRole.MEMBER){
                return Result.Failure(`Transfer initializer is not a team captain`, ErrorType.Conflict);
             }
             if (memberR?.role === TeamRole.CAPTAIN){
                return Result.Failure(`Transfer reciver is not a team member`, ErrorType.Conflict);
             }
    
            const transferResult = this.teamMemberRepoWrite.update(team.teamId, transferUser.id, TeamRole.MEMBER);
            const recieveResult = this.teamMemberRepoWrite.update(team.teamId, reciveUser.id, TeamRole.CAPTAIN);
            if (!transferResult || !recieveResult){
                return Result.Failure(`Failed to update team membership transfer`, ErrorType.Internal);
            }
            
            return Result.Success();
        }
    
        async leaveTeam(gamerTagInitializer: string, teamId: number, userId: number): Promise<Result<void>> {
            const userInit = await this.userRepo.findByUsername(gamerTagInitializer);
            if (userInit.id === 0){
                return Result.Failure(`User with ${gamerTagInitializer} gamer tag doesn't exist`, ErrorType.NotFound);
            }
    
            const userDelete = await this.userRepo.findById(userId);
            if (userDelete.id === 0){
                return Result.Failure(`User with ${userId} id doesn't exist`, ErrorType.NotFound);
            }
            
            const team = await this.teamRepoRead.findById(teamId);
            if (team.teamId === 0){
                return Result.Failure(`Team with ${teamId} id doesn't exist`, ErrorType.NotFound);
            }
    
            const members = await this.teamMemberRepoRead.findByTeamId(team.teamId);
            const isCaptain = members.some(x => x.userId === userInit.id && x.role === TeamRole.CAPTAIN);
            //Leave
            if (userDelete.id === userInit.id){
                if (isCaptain){
                    return Result.Failure(`The Captain needs to transfer the ownership of the team before leaving`, ErrorType.Conflict);
                }
            }//Kick
            else if (userDelete.id !== userInit.id){
                if (!isCaptain){
                    return Result.Failure(`Only a Captain can kick someone out`, ErrorType.Conflict);
                }
            }
            //if its not in the members or the memeber or invites
            const isMember = members.some(x => x.userId === userDelete.id);
            if (!isMember){
                return Result.Failure(`The user that you want to delete is not in the team`, ErrorType.Conflict);
            }
            const invite = await this.inviteRepoRead.find(team.teamId, userDelete.id);
            if (invite.userId !== 0){
                const resultInivte = await this.inviteRepoWrite.delete(team.teamId, userDelete.id);
            }
    
            const resultMember = await this.teamMemberRepoWrite.delete(team.teamId, userDelete.id);
            if (!resultMember){
                return Result.Failure(`Couldn't delete from members`, ErrorType.Internal);
            }
           return Result.Success();
        }
    
        async getTeamMembers(teamId: number): Promise<Result<UserDto[]>> {
        
            const allUsers = await this.userRepo.findAll();
            const team = await this.teamRepoRead.findById(teamId);
            if (team.teamId === 0){
                return Result.Failure(`Team with ${teamId} doesn't exist`, ErrorType.NotFound);
            }
    
            const members = await this.teamMemberRepoRead.findByTeamId(team.teamId);
            
            const usersReturn = allUsers.filter(user => members.some(m => m.userId === user.id));
    
            return Result.Success(usersReturn.map((u) => new UserDto(u.id, u.gamerTag, u.email, u.role, u.profilePicture, u.isActive)))
        }
        async getInvites(gamerTag: string): Promise<Result<InviteDto[]>> {
            const currentUser = await this.userRepo.findByUsername(gamerTag);
            if (currentUser.id === 0) return Result.Failure(`User with ${gamerTag} username doesn't exist`, ErrorType.NotFound);;
            
            const invites = await this.inviteRepoRead.findByUserId(currentUser.id);
            const ret = invites.filter(x => x.status === TeamInviteStatus.PENDING);
            return Result.Success(ret.map(i => new InviteDto(i.userId, i.teamId, i.invitedAt, i.status)));
        }
        async getInvitesByTeamId(teamId: number): Promise<Result<InviteDto[]>> {
            const team = await this.teamRepoRead.findById(teamId);
            if (team.teamId === 0){
                return Result.Failure(`Team with ${teamId} doesn't exist`, ErrorType.NotFound);
            }

            const invites = await this.inviteRepoRead.findByTeamId(teamId);
            return Result.Success(invites.map(i => new InviteDto(i.userId, i.teamId, i.invitedAt, i.status)));
        }
        async getCaptain(teamId: number): Promise<Result<UserDto>> {
            const team = await this.teamRepoRead.findById(teamId);
            if (team.teamId === 0){
                return Result.Failure(`Team with ${teamId} doesn't exist`, ErrorType.NotFound);
            }
            const members = await this.teamMemberRepoRead.findByTeamId(teamId);
            const membersCaptain = members.find(m => m.role === TeamRole.CAPTAIN);
            const captain = await this.userRepo.findById(membersCaptain?.userId as number);
            if (captain.id === 0){
                return Result.Failure(`Team captain doesn't exist`, ErrorType.NotFound);
            }
            return Result.Success(new UserDto(captain.id, captain.gamerTag, captain.email, captain.role,
                captain.profilePicture, captain.isActive, captain.createdAt
            ));
        }
}