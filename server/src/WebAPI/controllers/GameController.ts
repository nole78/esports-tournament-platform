import { Router, Request, Response } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { IGameService } from "../../Domain/services/games/IGameService";
import { CreateGameDto } from '../../Domain/DTOs/games/CreateGameDto';
import { ValidationResult } from '../../Domain/types/validation/ValidationResult';
import { validateGameCreation } from "../validators/games/validateGameCreation";
import { handleResult } from "../mappers/ResultMapper";
import { IAuditService } from "../../Domain/services/audit/IAuditService";

export class GameController{
    private readonly router = Router();

    public constructor(private readonly gameService: IGameService, private readonly auditService: IAuditService){
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
        handleResult(result,res);
    }

    private async getById(req: Request, res: Response) : Promise<void>{
        const id = parseInt(req.params.id as string, 10);
        if(isNaN(id)) {res.status(400).json({ success: false, message: "Invalid id"}); return; }
        const result = await this.gameService.getById(id);
        handleResult(result,res);
    }

    private async create(req: Request, res: Response): Promise<void> {
        const {gameName,gameGenre,gameLogotip,gamePlayers} = req.body as {gameName?:string, gameGenre?:string, gameLogotip?:string, gamePlayers?:number};
        const v:ValidationResult = validateGameCreation(gameName ?? "",gameGenre ?? "",gamePlayers ?? 0);
        if(!v.valid) {res.status(400).json({ success: false, message: v.message }); return;}
        const result = await this.gameService.create(new CreateGameDto( gameName, gameLogotip, gameGenre, gamePlayers ));
        await this.auditService.log({
            userId: req.user?.id,
            action: "GAME_CREATED",
            entity: "Game",
            entityId: result.value!.gameId,
            meta: {},
            ipAddress: req.ip
          });
        handleResult(result,res);
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.gameService.update(id, req.body);
        await this.auditService.log({
            userId: req.user?.id,
            action: "GAME_UPDATED",
            entity: "Game",
            entityId: id,
            meta: {},
            ipAddress: req.ip
          });
        handleResult(result, res);
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.gameService.delete(id);
        await this.auditService.log({
            userId: req.user?.id,
            action: "GAME_DELETED",
            entity: "Game",
            entityId: id,
            meta: {},
            ipAddress: req.ip
          });
        handleResult(result,res);
    }

    public getRouter(): Router { return this.router; }
}
 