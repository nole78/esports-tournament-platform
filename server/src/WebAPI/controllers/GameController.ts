import { Router, Request, Response } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { IGameService } from "../../Domain/services/games/IGameService";
import { CreateGameDto } from '../../Domain/DTOs/games/CreateGameDto';
import { User } from "../../Domain/models/User";
import { ValidationResult } from '../../Domain/types/ValidationResult';
import { validateGameCreation } from "../validators/games/validateGameCreation";

export class GameController{
    private readonly router = Router();

    public constructor(private readonly gameService: IGameService){
        this.router.get("/games", this.getAll.bind(this))
        this.router.get("/games/:id", this.getById.bind(this))
        this.router.post("/games", authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
        this.router.patch("/games/:id", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/games/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
    }

    private async getAll(req: Request, res: Response) : Promise<void>{
        const page  = parseInt(req.query.page  as string ?? "1",  10);
        const limit = parseInt(req.query.limit as string ?? "20", 10);
        const result = await this.gameService.getAll(page, limit);
        res.status(200).json({ success: true, data: result });
    }

    private async getById(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const entity = await this.gameService.getById(id);
        if(!entity) {res.status(404).json({ success: false, message: "Not found"}); return; }
        res.status(200).json({ success: true, data: entity});
    }

    private async create(req: Request, res: Response): Promise<void> {
        const {gameName,gameGenre,gameLogotip,gamePlayers} = req.body as {gameName?:string, gameGenre?:string, gameLogotip?:string, gamePlayers?:number};
        const v:ValidationResult = validateGameCreation(gameName ?? "",gameGenre ?? "",gamePlayers ?? 0);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}

        const created = await this.gameService.create(new CreateGameDto( gameName, gameLogotip, gameGenre, gamePlayers ));
        if (!created) { res.status(500).json({ success: false, message: "Failed to create" }); return; }
        res.status(201).json({ success: true, data: created });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.gameService.update(id, req.body);
        res.status(ok ? 200 : 500).json({ success: ok });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.gameService.delete(id);
        res.status(ok ? 200 : 500).json({ success: ok });
    }

    public getRouter(): Router { return this.router; }
}
 