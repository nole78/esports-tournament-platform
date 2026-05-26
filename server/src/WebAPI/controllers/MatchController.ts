import { Router, Request, Response } from "express";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { handleResult } from "../mappers/ResultMapper";
import { MatchResultDto } from '../../Domain/DTOs/matches/MatchResultDto';
import { AddPlayersDto } from "../../Domain/DTOs/match_players/AddPlayersDto";
import { IMatchPlayerService } from "../../Domain/services/match_players/IMatchPlayerService";
import { ValidationResult } from "../../Domain/types/validation/ValidationResult";
import { validateMatchResult } from "../validators/matches/validateMatchResult";
import { validatePerformanceNotes } from "../validators/matches/validatePerformanceNotes";
import { validateAddPlayers } from "../validators/matches/validateAddPlayers";

export class MatchController {
    private readonly router = Router();
    public constructor(
        private readonly matchService: IMatchService,
        private readonly matchPlayerService: IMatchPlayerService
    ){
        this.router.get("/matches/tournament/:id", this.getAllForTournament.bind(this));
        this.router.get("/matches/:id", this.getDetails.bind(this));
        this.router.get("/matches/:id/players/:teamId", authenticate, this.getPlayers.bind(this));
        this.router.patch("/matches/:id/result", authenticate, authorize(UserRole.ADMIN), this.setResult.bind(this));
        this.router.post("/matches/:id/players", authenticate, this.addPlayers.bind(this));
        this.router.put("/matches/:id/players/:userId", authenticate, this.changePerformanceNotes.bind(this));
        this.router.delete("/matches/:id/players/:userId", authenticate, this.removePlayer.bind(this));
    }

    private async getAllForTournament(req: Request, res: Response) : Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid tournament id"}); return;}

        const result = await this.matchService.getByTournamentId(id);
        handleResult(result, res);
    }

    private async getDetails(req: Request, res: Response) : Promise<void> {
        const id = parseInt(req.params.id as string, 10)
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }

        const result = await this.matchService.getById(id);
        handleResult(result, res);
    }

    private async setResult(req: Request, res: Response) : Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return;}
        
        const {teamRedScore,teamBlueScore} = req.body as {teamRedScore?:number,teamBlueScore?:number};
        const v:ValidationResult = validateMatchResult(teamRedScore, teamBlueScore);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const result = await this.matchService.setResult(id,new MatchResultDto(teamRedScore,teamBlueScore));
        handleResult(result,res);
    }

    private async changePerformanceNotes(req: Request, res: Response) : Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return;}
        
        const userId = parseInt(req.params.userId as string, 10);
        if(isNaN(userId)) {res.status(400).json({ success: false, message: "Invalid id"}); return;}

        const {notes} = req.body as {notes?: string};
        const v:ValidationResult = validatePerformanceNotes(notes);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const actorId = req.user?.id ?? 0;
        const result = await this.matchPlayerService.setPerformanceNotes(id, userId, actorId, notes ?? "");
        handleResult(result, res);
    }

    private async getPlayers(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid match id" }); return; }

        const teamId = parseInt(req.params.teamId as string, 10);
        if (isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid team id" }); return; }

        const result = await this.matchPlayerService.getMatchPlayers(id, teamId);
        handleResult(result, res);
    }

    private async addPlayers(req: Request, res: Response) : Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return;}
        
        const {teamId, userIds} = req.body as {teamId?:number,userIds?:number[]};
        const v:ValidationResult = validateAddPlayers(teamId,userIds);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const result = await this.matchPlayerService.addPlayersToMatch(id,new AddPlayersDto(teamId, userIds));
        handleResult(result, res);
    }

    private async removePlayer(req: Request, res: Response) : Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return;}
        
        const userId = parseInt(req.params.userId as string, 10);
        if(isNaN(userId)) {res.status(400).json({ success: false, message: "Invalid id"}); return;}
        
        const result = await this.matchPlayerService.removePlayerFromMatch(id,userId);
        handleResult(result, res);
    }

    public getRouter(): Router { return this.router; }
}