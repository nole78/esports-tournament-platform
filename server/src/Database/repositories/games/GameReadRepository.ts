import { ResultSetHeader, RowDataPacket } from "mysql2";
import { CreateGameDto } from "../../../Domain/DTOs/games/CreateGameDto";
import { Game } from "../../../Domain/models/Game";
import { IGameReadRepository } from "../../../Domain/repositories/games/IGameReadRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";

export class GameReadRepository implements IGameReadRepository{
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ){}

      private map(r: RowDataPacket): Game {
        return new Game(r.game_id, r.game_name, r.game_logotip, r.game_genre, r.players_per_team);
      }

    async findById(id: number): Promise<Game> {
        const res = await this.db.getReadConnection();
        if(!res) return new Game;
        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM games WHERE game_id = ?`,[id]);
            return rows.length > 0 ? this.map(rows[0]) : new Game;
        }
        catch (err) {
            this.logger.error("GameRepository","findById failed",err);
            return new Game;
        }
        finally{
            if(!res.isTransaction)
                res.conn.release();
        }
    }

    async findByName(name: string): Promise<Game> {
        const res = await this.db.getReadConnection();
        if(!res) return new Game;
        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM games WHERE game_name = ?`,[name]);
            return rows.length > 0 ? this.map(rows[0]) : new Game;
        }
        catch (err) {
            this.logger.error("GameRepository","findByName failed",err);
            return new Game;
        }
        finally{ if(!res.isTransaction)
        res.conn.release();}
    }
    
    async findAll(page = 1, limit = 20): Promise<Game[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
            const offset = (page - 1) * limit;
        try {
            const [rows] = await res.conn.query<RowDataPacket[]>(`SELECT * FROM games ORDER BY game_id LIMIT ? OFFSET ?`, [limit,offset]);
            const items =  rows.map((r) => this.map(r));

            return items;      
        } catch (err) {
            this.logger.error("GameRepository", "findAll failed", err);
            return [];
        } finally { if(!res.isTransaction)
        res.conn.release(); }
    }

    async getTotal(): Promise<number> {
        const res = await this.db.getReadConnection();
            if (!res) return 0;
        try{
            const [cnt] = await res.conn.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM games`);
            return cnt[0]?.total ?? 0;
        }
        catch (err){
            this.logger.error("GameRepository", "get total failed", err);
            return 0;
        } finally { if(!res.isTransaction)
        res.conn.release(); }
    }
}