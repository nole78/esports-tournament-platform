import { Router, Request, Response } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { IUserWatchlistService } from "../../Domain/services/user_watchlist/IUserWatchlistService";
import { handleResult } from "../mappers/ResultMapper";
import { UserRole } from "../../Domain/enums/UserRole";

export class UserWatchlistController{
    private readonly router = Router();

    public constructor(private readonly watchlistService: IUserWatchlistService){
        this.router.post("/watchlist", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.getListByUserId.bind(this));
        this.router.delete("/watchlist/:tournamentId", authenticate, authorize(UserRole.PLAYER, UserRole.ADMIN), this.removeFromWatchList.bind(this));
    }

    private async getListByUserId(req: Request, res: Response) : Promise<void>{
        const userId = parseInt(req.body.id as string, 10);
        const page  = parseInt(req.query.page  as string ?? "1",  10);
        const limit = parseInt(req.query.limit as string ?? "20", 10);
        const result = await this.watchlistService.getByUserId(userId, page, limit);
        handleResult(result,res);
    }

    private async removeFromWatchList(req: Request, res: Response) : Promise<void>{
        const userId = parseInt(req.body.id as string, 10);
        const tournamentId = parseInt(req.params.tournamentId as string, 10);
        if (isNaN(userId) || isNaN(tournamentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const result = await this.watchlistService.remove(userId, tournamentId);
        handleResult(result,res);
    }

    public getRouter(): Router { return this.router; }
}
