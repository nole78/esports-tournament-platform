import { Router, Request, Response } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ITournamentServiceWrite } from "../../Domain/services/tournaments/ITournamentServiceWrite";
import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { ValidationResult } from '../../Domain/types/ValidationResult';
import { validateTournamentCreation } from "../validators/tournaments/validateTournamentCreation";
import { TournamentFormat } from '../../Domain/enums/TournamentFormat';
import { TournamentStatus } from '../../Domain/enums/TournamentStatus';
import { handleResult } from "../mappers/ResultMapper";
import { validateTournamentUpdate } from "../validators/tournaments/validateTournamentUpdate";
import { ITournamentServiceRead } from "../../Domain/services/tournaments/ITournamentServiceRead";
export class TournamentController{
    private readonly router = Router();

    public constructor(private readonly tournamentServiceRead: ITournamentServiceRead, private readonly tournamentServiceWrite: ITournamentServiceWrite){
        this.router.get("/tournaments", this.getAll.bind(this));
        this.router.get("/tournaments/:id", this.getById.bind(this));
        this.router.post("/tournaments", authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
        this.router.put("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
    }

    private async getAll(req: Request, res: Response) : Promise<void>{
        const page  = parseInt(req.query.page  as string ?? "1",  10);
        const limit = Math.min(parseInt(String(req.query.limit ?? "12"), 10), 100);
        
        const filters = {
        tournamentGame: req.query.tournamentGame as string,
        tournamentFormat: req.query.tournamentFormat as TournamentFormat,
        tournamentStatus: req.query.tournamentStatus as TournamentStatus
        };
    
        const hasFilters = Object.values(filters).some(v => v);
    
        const result = hasFilters 
            ? await this.tournamentServiceRead.getFiltered(filters, page, limit)
            : await this.tournamentServiceRead.getAll(page, limit);
        handleResult(result, res);
        }

    private async getById(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.tournamentServiceRead.getById(id);
        handleResult(result, res);
    }

    private async create(req: Request, res: Response) : Promise<void>{
        const {tournamentName, tournamentGame, tournamentFormat, tournamentMaxTeams, tournamentApplicationDeadline, tournamentPrizeFund, tournamentStatus} 
        = req.body as {tournamentName?:string, tournamentGame?:string, tournamentFormat?:TournamentFormat, tournamentMaxTeams?:number, tournamentApplicationDeadline?:Date, tournamentPrizeFund?:number, tournamentStatus?:TournamentStatus};
        const v:ValidationResult = validateTournamentCreation(tournamentName ?? "", tournamentGame ?? "", tournamentMaxTeams ?? 0, tournamentApplicationDeadline ?? new Date(), tournamentPrizeFund ?? 0, tournamentFormat, tournamentStatus);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const result = await this.tournamentServiceWrite.create(new CreateTournamentDto( tournamentName, tournamentGame, tournamentFormat, tournamentMaxTeams, tournamentApplicationDeadline, tournamentPrizeFund, tournamentStatus));
        handleResult(result, res);    
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        
        const {tournamentName, tournamentFormat, tournamentMaxTeams, tournamentApplicationDeadline, tournamentPrizeFund, tournamentStatus} 
        = req.body as {tournamentName?:string, tournamentFormat?:TournamentFormat, tournamentMaxTeams?:number, tournamentApplicationDeadline?:Date, tournamentPrizeFund?:number, tournamentStatus?:TournamentStatus};
        const v:ValidationResult = validateTournamentUpdate(tournamentName ?? "", tournamentMaxTeams ?? 0, tournamentApplicationDeadline ?? new Date(), tournamentPrizeFund ?? 0, tournamentFormat, tournamentStatus);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}
        
        const result = await this.tournamentServiceWrite.update(id, req.body);
        handleResult(result, res);
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.tournamentServiceWrite.delete(id);
        handleResult(result, res);
    }

    public getRouter(): Router { return this.router; }
}