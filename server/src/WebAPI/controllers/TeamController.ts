import {Request, Response, Router} from "express";
import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { TeamRole } from "../../Domain/enums/TeamRole";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ValidationResult } from '../../Domain/types/ValidationResult';
import { validateTeamsCreation } from "../validators/teams/validateTeamsCreation";
import { TeamDto } from "../../Domain/DTOs/teams/TeamDto";
import { fail } from "node:assert";

export class TeamController{
    private readonly  router = Router();

    public constructor(private readonly teamService: ITeamService){
        this.router.get("/teams", this.getAll.bind(this));
        this.router.get("/teams/:id", this.getById.bind(this));
        this.router.post("/teams/:id", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.create.bind(this));
    }

    private async getAll(req: Request, res: Response) : Promise<void>{
        const page = parseInt(req.query.page as string ?? "1", 10);
        const limit = parseInt(req.query.limit as string ?? "20", 10);
        const result = await this.teamService.getAll(page, limit);
        res.status(200).json({ success: true, data: result});
    }

    private async getById(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)){res.status(400).json({success: false, message: "Id is not valid!"})}
        const entity = await this.teamService.getById(id);
        if (!entity) {res.status(404).json({success: false, message: "Id not found!"})};
        res.status(200).json({success: true, data: entity});
    }

    private async create(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

        const{teamName, teamTag, teamLogotip, teamDescription} = req.body as {teamName?:string, teamTag?:string, teamLogotip?:string, teamDescription?:string};
        const v:ValidationResult = validateTeamsCreation(teamName ?? "", teamTag ?? "", teamLogotip ?? "", teamDescription ?? "");
        if (!v.valid){res.status(400).json({success:false, message: v.message}); return;}

        const created = await this.teamService.create(new TeamDto(teamName, teamTag, teamLogotip, teamDescription), id);
        if (!created){res.status(500).json({success:false, messag: "Failed to create!"}); return;}
        res.status(201).json({success:true, data: created});
    } 
    public getRouter(): Router { return this.router; }
}