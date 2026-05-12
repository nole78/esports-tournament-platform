import { Router, Request, Response } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { ValidationResult } from '../../Domain/types/ValidationResult';
import { validateTournamentCreation } from "../validators/tournaments/validateTournamentCreation";
import { TournamentFormat } from '../../Domain/enums/TournamentFormat';
import { TournamentStatus } from '../../Domain/enums/TournamentStatus';
export class TournamentController{
    private readonly router = Router();

    public constructor(private readonly tournamentService: ITournamentService){
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
    
        const hasFilters = Object.values(filters).some(v => v !== undefined);
    
        const result = hasFilters 
            ? await this.tournamentService.getFiltered(filters, page, limit)
            : await this.tournamentService.getAll(page, limit);
        res.status(200).json({ success: true, data: result });
    }

    private async getById(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const entity = await this.tournamentService.getById(id);
        if(!entity) {res.status(404).json({ success: false, message: "Not found"}); return; }
        res.status(200).json({ success: true, data: entity});
    }

    private async create(req: Request, res: Response) : Promise<void>{
        const {tournamentName, tournamentGame, tournamentFormat, tournamentMaxTeams, tournamentApplicationDeadline, tournamentPrizeFund, tournamentStatus} 
        = req.body as {tournamentName?:string, tournamentGame?:string, tournamentFormat?:TournamentFormat, tournamentMaxTeams?:number, tournamentApplicationDeadline?:Date, tournamentPrizeFund?:number, tournamentStatus?:TournamentStatus};
        const v:ValidationResult = validateTournamentCreation(tournamentName ?? "", tournamentGame ?? "", tournamentMaxTeams ?? 0, tournamentApplicationDeadline ?? new Date(), tournamentPrizeFund ?? 0, tournamentFormat, tournamentStatus);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const created = await this.tournamentService.create(new CreateTournamentDto( tournamentName, tournamentGame, tournamentFormat, tournamentMaxTeams, tournamentApplicationDeadline, tournamentPrizeFund, tournamentStatus));
        if (!created) { res.status(500).json({ success: false, message: "Failed to create" }); return; }
        res.status(201).json({ success: true, data: created });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.tournamentService.update(id, req.body);
        res.status(ok ? 200 : 500).json({ success: ok });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.tournamentService.delete(id);
        res.status(ok ? 200 : 500).json({ success: ok });
    }

    public getRouter(): Router { return this.router; }
}