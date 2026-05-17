import { Router, Request, Response } from "express";
import { ITournamentRegistrationService } from '../../Domain/services/tournamentRegistration/ITournamentRegistrationService';
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ValidationResult } from "../../Domain/types/ValidationResult";
import { CreateTournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/CreateTournamentRegistrationDto";
import { validateTournamentRegistration } from "../validators/tournamentRegistrations/validateTournamentRegistration";

export class TournamentRegistrationController{
    private readonly router = Router();

    public constructor(private readonly tournamentRegistrationService: ITournamentRegistrationService){
        this.router.get("/tournaments/:id/registered", authenticate, this.getByTournamentId.bind(this));
        this.router.post("/tournaments/:id/register", authenticate, this.register.bind(this));
        this.router.delete("/tournaments/:id/register/:teamId", authenticate, this.delete.bind(this));
        this.router.patch("/tournament/:id/registrations/:teamId", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
    }

    private async getByTournamentId(req: Request, res: Response): Promise<void>{
        const page  = parseInt(req.query.page  as string ?? "1",  10);
        const limit = Math.min(parseInt(String(req.query.limit ?? "12"), 10), 100);
        const id = parseInt(req.query.id  as string,  10);
        const result = await this.tournamentRegistrationService.getByTournamentId(id, page, limit);
        res.status(200).json({ success: true, data: result });
    }

    private async register(req: Request, res: Response) : Promise<void>{
        const {teamId, tournamentId} 
                = req.body as {teamId?:number, tournamentId?:number};
        const v:ValidationResult = validateTournamentRegistration(teamId ?? 0, tournamentId ?? 0);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const created = await this.tournamentRegistrationService.create(new CreateTournamentRegistrationDto(teamId, tournamentId));
        if (!created) { res.status(500).json({ success: false, message: "Failed to create" }); return; }
        res.status(201).json({ success: true, data: created });
    }
     private async delete(req: Request, res: Response): Promise<void> {
        const tournamentId = parseInt(req.params.id as string, 10);
        const teamId = parseInt(req.params.teamId as string, 10);
        if (isNaN(tournamentId) || isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.tournamentRegistrationService.delete(tournamentId, teamId);
        res.status(ok ? 200 : 500).json({ success: ok });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const tournamentId = parseInt(req.params.tournamentId as string, 10);
        const teamId = parseInt(req.params.teamId as string, 10);
        if (isNaN(tournamentId) || isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.tournamentRegistrationService.update(tournamentId, teamId, req.body);
        res.status(ok ? 200 : 500).json({ success: ok });
    }

    public getRouter(): Router { return this.router; }
}