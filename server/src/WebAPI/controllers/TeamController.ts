import {Request, Response, Router} from "express";
import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ValidationResult } from '../../Domain/types/validation/ValidationResult';
import { validateTeams } from "../validators/teams/validateTeams";
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { handleResult } from "../mappers/ResultMapper";
import { Result } from '../../Domain/common/Result';
import { User } from "../../Domain/models/User";
import { logger } from '../../app';
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { ITeamMemberService } from "../../Domain/services/teamMember/ITeamMemberService";


export class TeamController{
    private readonly  router = Router();

    public constructor(private readonly teamService: ITeamService, private readonly teamMemberService: ITeamMemberService, private readonly auditService: IAuditService){
        this.router.get("/teams", authenticate, this.getByGamerTag.bind(this));
        this.router.post("/teams", authenticate, this.create.bind(this));
        this.router.get("/teams/user/:id", authenticate,this.getTeamsById.bind(this));
        this.router.get("/teams/:id", this.getTeamsByIdGuest.bind(this));
        this.router.put("/teams/:id", authenticate, this.update.bind(this));
        this.router.delete("/teams/:id", authenticate, this.delete.bind(this));
        
        this.router.post("/teams/:id/invite", authenticate, this.invite.bind(this));
        this.router.post("/teams/:id/invite/respond", authenticate, this.inviteRespond.bind(this));
        this.router.patch("/teams/:id/members/:userId/role", authenticate, this.transferRole.bind(this));
        this.router.delete("/teams/:id/members/:userId", authenticate, this.leaveTeam.bind(this));
        
        
        this.router.get("/teams/invites/all", authenticate, this.allInvites.bind(this));
        this.router.get("/teams/members/:id", this.getMembers.bind(this));
        this.router.get("/teams/mine/all", authenticate, this.allMyTeams.bind(this));
        this.router.get("/teams/guest/all", this.getAll.bind(this));
        this.router.get("/teams/invites/details/:id", authenticate, this.getInvitesByTeamId.bind(this));
        this.router.get("/teams/captain/:id", this.getTeamCaptain.bind(this));
    }

    private async getAll(req: Request, res: Response) : Promise<void>{
        const page = parseInt(req.query.page as string ?? "1", 10);
        const limit = parseInt(req.query.limit as string ?? "20", 10);
        const result = await this.teamService.getAll(page, limit);
        handleResult(result, res);
    }

    private async getTeamsById(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username as string;
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.teamService.getById(id, gamerTag);
        handleResult(result, res);
    }
    
    private async getByGamerTag(req: Request, res: Response) : Promise<void>{
        const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10), 100);
        const page = parseInt(String(req.query.page ?? "1"), 10);
        const gamer_tag = req.user?.username as string;
        const result = await this.teamService.getByGamerTag(gamer_tag, limit, page);
        handleResult(result, res);
    }   

    private async create(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username as string;
        
        const {teamName, teamTag, teamLogotip, teamDescription} = (req.body.team ?? {}) as {teamName?:string, teamTag?:string, teamLogotip?:string, teamDescription?:string};
        const safeTeamName = teamName ?? "";
        const safeTeamTag = teamTag ?? "";
        const safeTeamLogotip = teamLogotip ?? "";
        const safeTeamDescription = teamDescription ?? "";
        
        const v:ValidationResult = validateTeams(safeTeamName, safeTeamTag, safeTeamLogotip, safeTeamDescription);
        if (!v.valid){res.status(400).json({success:false, message: v.message}); return;}
        
        const result = await this.teamService.create(new CreateTeamDto(safeTeamName, safeTeamTag, safeTeamLogotip, safeTeamDescription), gamerTag);
        await this.auditService.log({
            userId: req.user?.id,
            action: "TEAM_CREATED",
            entity: "Team",
            entityId: result.value!.teamId,
            meta: {},
            ipAddress: req.ip
          });
        handleResult(result, res);
    } 

    

    private async update(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username as string;
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }

        const {teamName, teamTag, teamLogotip, teamDescription} = (req.body ?? {}) as {teamName?:string, teamTag?:string, teamLogotip?:string, teamDescription?:string};
        const safeTeamName = teamName ?? "";
        const safeTeamTag = teamTag ?? "";
        const safeTeamLogotip = teamLogotip ?? "";
        const safeTeamDescription = teamDescription ?? "";

        const v:ValidationResult = validateTeams(safeTeamName, safeTeamTag, safeTeamLogotip, safeTeamDescription);
        if (!v.valid){res.status(400).json({success:false, message: v.message}); return;}

        const result = await this.teamService.update(gamerTag, req.body, id);
        await this.auditService.log({
            userId: req.user?.id,
            action: "TEAM_UPDATED",
            entity: "Team",
            entityId: id,
            meta: {},
            ipAddress: req.ip
          });
        handleResult(result, res);
    }

    private async delete(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username as string;
        
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        
        const result = await this.teamService.delete(gamerTag, id);
        await this.auditService.log({
            userId: req.user?.id,
            action: "TEAM_DELETED",
            entity: "Team",
            entityId: id,
            meta: {},
            ipAddress: req.ip
        });
        handleResult(result, res);
    }

    private async invite(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username as string;
        const id = parseInt(req.params.id as string, 10);
        const gamerTagInvite = (req.body.userTag) as string;
        
        const safeGamerTagInvite = gamerTagInvite ?? "";

        if (isNaN(id)) {res.status(400).json({success: false, message: "Invalid id"}); return;}

        const result = await this.teamMemberService.invite(gamerTag, id, safeGamerTagInvite);
        handleResult(result, res);
    }

    private async inviteRespond(req:Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username as string;
        const id = parseInt(req.params.id as string, 10);
        //Answer needs to be YES or NO
        const answer = req.body.answer as string;
        const safeAnswer = answer ?? "";
        if (isNaN(id)) {res.status(400).json({success: false, message: "Invalid id"}); return;}

        const result = await this.teamMemberService.inviteResponse(gamerTag, id, safeAnswer);
        handleResult(result, res);
    }

    private async transferRole(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username ?? "";
        const teamId = parseInt(req.params.id as string,10);
        const userId = parseInt(req.params.userId as string,10);
        if (isNaN(teamId) || isNaN(userId)) {res.status(400).json({success: false, message: "Invalid id"}); return;}

        const result = await this.teamMemberService.transferCaptainship(gamerTag, teamId, userId);
        handleResult(result, res);
    }

    private async leaveTeam(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username ?? "";
        const teamId = parseInt(req.params.id as string,10);
        const userId = parseInt(req.params.userId as string,10);
        if (isNaN(teamId) || isNaN(userId)) {res.status(400).json({success: false, message: "Invalid id"}); return;}

        const result = await this.teamMemberService.leaveTeam(gamerTag, teamId, userId);
        handleResult(result, res);
    }

    private async getMembers(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.teamMemberService.getTeamMembers(id);
        handleResult(result, res);
    }

    private async allInvites(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username as string;
        const result = await this.teamMemberService.getInvites(gamerTag);
        handleResult(result, res);
    }
    
    private async allMyTeams(req: Request, res: Response) : Promise<void>{
        const gamerTag = req.user?.username as string;
        const result = await this.teamService.getAllMyTeams(gamerTag);
        handleResult(result, res);
    }

    private async getTeamsByIdGuest(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.teamService.getByIdGuest(id);
        handleResult(result, res);
    }
    private async getInvitesByTeamId(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.teamMemberService.getInvitesByTeamId(id);
        handleResult(result, res);
    }
    private async getTeamCaptain(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.teamMemberService.getCaptain(id);
        handleResult(result, res);
    }
    public getRouter(): Router { return this.router; }
}