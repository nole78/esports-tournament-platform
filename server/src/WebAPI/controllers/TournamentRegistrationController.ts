import { Router, Request, Response } from "express";
import { ITournamentRegistrationWriteService } from '../../Domain/services/tournamentRegistration/ITournamentRegistrationWriteService';
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ValidationResult } from "../../Domain/types/validation/ValidationResult";
import { CreateTournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/CreateTournamentRegistrationDto";
import { validateTournamentRegistration } from "../validators/tournamentRegistrations/validateTournamentRegistration";
import { handleResult } from "../mappers/ResultMapper";
import { TournamentRegistrationStatus } from "../../Domain/enums/TournamentRegistrationStatus";
import { ITournamentRegistrationReadService } from "../../Domain/services/tournamentRegistration/ITournamentRegistrationReadService";

export class TournamentRegistrationController{
    private readonly router = Router();

    public constructor(private readonly tournamentRegistrationReadService: ITournamentRegistrationReadService, private readonly tournamentRegistrationWriteService: ITournamentRegistrationWriteService){
        this.router.get("/tournaments/:id/registered", authenticate, this.getByTournamentId.bind(this));
        this.router.post("/tournaments/:id/register",  this.register.bind(this));
        this.router.delete("/tournaments/:id/register/:teamId", authenticate, this.delete.bind(this));
        this.router.patch("/tournaments/:id/registrations/:teamId", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
        this.router.post("/tournaments/:id/generate-bracket", authenticate, authorize(UserRole.ADMIN), this.generateBracket.bind(this));
    }

    private async getByTournamentId(req: Request, res: Response): Promise<void>{
        const page  = parseInt(req.query.page  as string ?? "1",  10);
        const limit = Math.min(parseInt(String(req.query.limit ?? "12"), 10), 100);
        const state = req.query.status as TournamentRegistrationStatus;
        const id = parseInt(req.params.id  as string,  10);
        if(isNaN(id)){res.status(400).json({ succes: false, message: "Invalid id"}); return; }
        const result = await this.tournamentRegistrationReadService.getByTournamentId(id, state, page, limit);
        handleResult(result, res);
    }

    private async register(req: Request, res: Response) : Promise<void>{
        const {teamId, tournamentId} 
                = req.body as {teamId?:number, tournamentId?:number};
        const v:ValidationResult = validateTournamentRegistration(teamId ?? 0, tournamentId ?? 0);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const result = await this.tournamentRegistrationWriteService.create(new CreateTournamentRegistrationDto(teamId, tournamentId));
        handleResult(result, res);
    }
     private async delete(req: Request, res: Response): Promise<void> {
        const tournamentId = parseInt(req.params.id as string, 10);
        const teamId = parseInt(req.params.teamId as string, 10);
        if (isNaN(tournamentId) || isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.tournamentRegistrationWriteService.delete(tournamentId, teamId);
        handleResult(result, res);
    }

    private async update(req: Request, res: Response): Promise<void> {
        const tournamentId = parseInt(req.params.id as string, 10);
        const teamId = parseInt(req.params.teamId as string, 10);
        if (isNaN(tournamentId) || isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.tournamentRegistrationWriteService.update(tournamentId, teamId, req.body);
        handleResult(result, res);
    }

    private async generateBracket(req: Request, res: Response): Promise<void>
    {
        const tournamentId = parseInt(req.params.id as string, 10);
        if (isNaN(tournamentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.tournamentRegistrationWriteService.generateBracket(tournamentId);
        handleResult(result, res);
    }

    public getRouter(): Router { return this.router; }
}