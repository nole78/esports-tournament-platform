import {Request, Response, Router} from "express";
import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { TeamRole } from "../../Domain/enums/TeamRole";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ValidationResult } from '../../Domain/types/ValidationResult';
import { validateTeamsCreation } from "../validators/teams/validateTeamsCreation";
import { TeamDto } from '../../Domain/DTOs/teams/TeamDto';
import { fail } from "node:assert";
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { User } from "../../Domain/models/User";
import { logger } from '../../app';
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

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
        res.status(200).json({ success: true, data: result});
    }

    private async getTeamsById(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.teamService.getById(id);
        if (!result){
            res.status(404).json({success:false, message:"ID not found!"});
        }
        res.status(200).json({success:true, data: result});
    }
    
    private async getByGamerTag(req: Request, res: Response) : Promise<void>{
        const gamer_tag = req.user?.username as string;
        const entity = await this.teamService.getByGamerTag(gamer_tag);
        if (!entity) {
            res.status(404).json({success: false, message: "Tag not found!"}); return;};
        res.status(200).json({success: true, data: entity});
    }

    private async create(req: Request, res: Response) : Promise<void>{
        const gamer_tag = req.user?.username as string;
        
        const {teamName, teamTag, teamLogotip, teamDescription} = req.body.team as {teamName?:string, teamTag?:string, teamLogotip?:string, teamDescription?:string};
        
        const v:ValidationResult = validateTeamsCreation(teamName ?? "", teamTag ?? "", teamLogotip ?? "", teamDescription ?? "");
        if (!v.valid){res.status(400).json({success:false, message: v.message}); return;}
        
        const created = await this.teamService.create(new CreateTeamDto(teamName, teamTag, teamLogotip, teamDescription), gamer_tag);
        if (!created){res.status(500).json({success:false, messag: "Failed to create!"}); return;}
        res.status(201).json({success:true, data: created});
    } 

    private async addMember(req: Request, res: Response) : Promise<void>{
        const gamer_tag = await req.params.gamer_tag as string;
        const team_tag = await req.params.team_tag as string;

        const ok = await this.teamService.addMember(gamer_tag, team_tag);
        res.status(ok? 200 : 500).json({success: ok});
        
    }

    private async update(req: Request, res: Response) : Promise<void>{
        const gamer_tag = req.user?.username as string;
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }

        const ok = await this.teamService.update(gamer_tag, req.body, id);
        res.status(ok? 200 : 500).json({ success: ok});
    }

    private async delete(req: Request, res: Response) : Promise<void>{
        const gamer_tag = req.user?.username as string;
        
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        
        const ok = await this.teamService.delete(gamer_tag, id);
        res.status(ok? 200 : 500).json({success: ok});
    }
    public getRouter(): Router { return this.router; }
}