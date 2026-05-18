import {Request, Response, Router} from "express";
import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ValidationResult } from '../../Domain/types/ValidationResult';
import { validateTeamsCreation } from "../validators/teams/validateTeamsCreation";
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { handleResult } from "../mappers/ResultMapper";
import { Result } from '../../Domain/common/Result';


export class TeamController{
    private readonly  router = Router();

    public constructor(private readonly teamService: ITeamService){
        this.router.get("/teams", authenticate, this.getByGamerTag.bind(this));
        this.router.post("/teams", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.create.bind(this));
        this.router.get("/teams/:id", this.getTeamsById.bind(this));
        this.router.patch("/teams/:id", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/teams/:id", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.delete.bind(this));
        
        //this.router.post("/teams/add/:gamer_tag/:team_tag", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.addMember.bind(this));
    }

    private async getAll(req: Request, res: Response) : Promise<void>{
        const page = parseInt(req.query.page as string ?? "1", 10);
        const limit = parseInt(req.query.limit as string ?? "20", 10);
        const result = await this.teamService.getAll(page, limit);
        handleResult(result, res);
    }

    private async getTeamsById(req: Request, res: Response) : Promise<void>{
        
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.teamService.getById(id);
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
        const gamer_tag = req.user?.username as string;
        
        const {teamName, teamTag, teamLogotip, teamDescription} = (req.body.team ?? {}) as {teamName?:string, teamTag?:string, teamLogotip?:string, teamDescription?:string};
        const safeTeamName = teamName ?? "";
        const safeTeamTag = teamTag ?? "";
        const safeTeamLogotip = teamLogotip ?? "";
        const safeTeamDescription = teamDescription ?? "";
        
        const v:ValidationResult = validateTeamsCreation(safeTeamName, safeTeamTag, safeTeamLogotip, safeTeamDescription);
        if (!v.valid){res.status(400).json({success:false, message: v.message}); return;}
        
        const result = await this.teamService.create(new CreateTeamDto(safeTeamName, safeTeamTag, safeTeamLogotip, safeTeamDescription), gamer_tag);
        handleResult(result, res);
    } 

    private async addMember(req: Request, res: Response) : Promise<void>{
        const gamer_tag = await req.params.gamer_tag as string;
        const team_tag = await req.params.team_tag as string;

        const result = await this.teamService.addMember(gamer_tag, team_tag);
        handleResult(result, res);
        
    }

    private async update(req: Request, res: Response) : Promise<void>{
        const gamer_tag = req.user?.username as string;
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }

        const result = await this.teamService.update(gamer_tag, req.body, id);
        handleResult(result, res);
    }

    private async delete(req: Request, res: Response) : Promise<void>{
        const gamer_tag = req.user?.username as string;
        
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        
        const result = await this.teamService.delete(gamer_tag, id);
        handleResult(result, res);
    }
    public getRouter(): Router { return this.router; }
}