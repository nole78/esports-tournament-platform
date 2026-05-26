import { Router, Request, Response } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { IUserWatchlistService } from "../../Domain/services/user_watchlist/IUserWatchlistService";
import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { ValidationResult } from '../../Domain/types/ValidationResult';
import { validateTournamentCreation } from "../validators/tournaments/validateTournamentCreation";
import { TournamentFormat } from '../../Domain/enums/TournamentFormat';
import { TournamentStatus } from '../../Domain/enums/TournamentStatus';
import { validateTournamentUpdate } from "../validators/tournaments/validateTournamentUpdate";
import { ITournamentReadService } from "../../Domain/services/tournaments/ITournamentReadService";
import { handleResult } from "../mappers/ResultMapper";
import { CreateUserWatchlistDto } from "../../Domain/DTOs/user_watchlists/CreateUserWatchlistDto";
import { ITournamentWriteService } from "../../Domain/services/tournaments/ITournamentWriteService";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
export class TournamentController{
    private readonly router = Router();

    public constructor(private readonly tournamentReadService: ITournamentReadService, private readonly tournamentWriteService: ITournamentWriteService, private readonly watchlistService: IUserWatchlistService, private readonly auditService: IAuditService){
        this.router.get("/tournaments", this.getAll.bind(this));
        this.router.get("/tournaments/:id", this.getById.bind(this));
        this.router.post("/tournaments/watch/check", this.findWatchListItem.bind(this));
        this.router.post("/tournaments/:id/watch", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.addToWatchList.bind(this));
        this.router.delete("/tournaments/:id/watch", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.removeFromWatchList.bind(this));
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
            ? await this.tournamentReadService.getFiltered(filters, page, limit)
            : await this.tournamentReadService.getAll(page, limit);
        handleResult(result, res);
        }

    private async getById(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.tournamentReadService.getById(id);
        handleResult(result, res);
    }

    private async create(req: Request, res: Response) : Promise<void>{
        const {tournamentName, tournamentGame, tournamentFormat, tournamentMaxTeams, tournamentApplicationDeadline, tournamentPrizeFund, tournamentStatus} 
        = req.body as {tournamentName?:string, tournamentGame?:string, tournamentFormat?:TournamentFormat, tournamentMaxTeams?:number, tournamentApplicationDeadline?:Date, tournamentPrizeFund?:number, tournamentStatus?:TournamentStatus};
        const v:ValidationResult = validateTournamentCreation(tournamentName ?? "", tournamentGame ?? "", tournamentMaxTeams ?? 0, tournamentApplicationDeadline ?? new Date(), tournamentPrizeFund ?? 0, tournamentFormat, tournamentStatus);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const result = await this.tournamentWriteService.create(new CreateTournamentDto( tournamentName, tournamentGame, tournamentFormat, tournamentMaxTeams, tournamentApplicationDeadline, tournamentPrizeFund, tournamentStatus));
        await this.auditService.log({
            userId: req.user?.id,
            action: "TOURNAMENT_CREATED",
            entity: "Team",
            entityId: result.value!.tournamentId,
            meta: {},
            ipAddress: req.ip
          });
        handleResult(result, res);    
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        
        const {tournamentName, tournamentFormat, tournamentMaxTeams, tournamentApplicationDeadline, tournamentPrizeFund, tournamentStatus} 
        = req.body as {tournamentName?:string, tournamentFormat?:TournamentFormat, tournamentMaxTeams?:number, tournamentApplicationDeadline?:Date, tournamentPrizeFund?:number, tournamentStatus?:TournamentStatus};
        const v:ValidationResult = validateTournamentUpdate(tournamentName ?? "", tournamentMaxTeams ?? 0, tournamentApplicationDeadline ?? new Date(), tournamentPrizeFund ?? 0, tournamentFormat, tournamentStatus);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}
        
        const result = await this.tournamentWriteService.update(id, req.body);
        await this.auditService.log({
            userId: req.user?.id,
            action: "TOURNAMENT_UPDATED",
            entity: "Team",
            entityId: id,
            meta: {},
            ipAddress: req.ip
          });
        handleResult(result, res);
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.tournamentWriteService.delete(id);
        await this.auditService.log({
            userId: req.user?.id,
            action: "TOURNAMENT_DELETED",
            entity: "Team",
            entityId: id,
            meta: {},
            ipAddress: req.ip
          });
        handleResult(result, res);
    }

    private async addToWatchList(req: Request, res: Response): Promise<void>{
        const userId = parseInt(req.body.userId as string, 10);
        const tournamentId = parseInt(req.params.id as string, 10);
        if (isNaN(userId) || isNaN(tournamentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.watchlistService.add(new CreateUserWatchlistDto(userId, tournamentId));
        handleResult(result,res);
    }

    private async removeFromWatchList(req: Request, res: Response): Promise<void>{
        const userId = parseInt(req.body.userId as string, 10);
        const tournamentId = parseInt(req.params.id as string, 10);
        if (isNaN(userId) || isNaN(tournamentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.watchlistService.remove(userId, tournamentId);
        handleResult(result,res);
    }

    private async findWatchListItem(req: Request, res: Response): Promise<void>
    {
        console.log(req.user);
        const userId = parseInt(req.body.userId as string, 10);
        const tournamentId = parseInt(req.body.tournamentId as string, 10);
        if (isNaN(userId) || isNaN(tournamentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.watchlistService.findWatchListItem(userId, tournamentId);
        handleResult(result,res);
    }

    public getRouter(): Router { return this.router; }
}