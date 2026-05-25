import { ResultSetHeader, RowDataPacket } from "mysql2";
import { CreateGameDto } from "../../../Domain/DTOs/games/CreateGameDto";
import { Game } from "../../../Domain/models/Game";
import { IGameRepository } from "../../../Domain/repositories/games/IGameRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";

export class GameRepository implements IGameRepository{
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
        finally{ res.conn.release();}
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
        finally{ res.conn.release();}
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
        } finally { res.conn.release(); }
        }

    async create(game: Game): Promise<Game> {
                const res = await this.db.getWriteConnection();
        if (!res) return new Game;
        try {
        const [result] = await res.conn.execute<ResultSetHeader>(
            `INSERT INTO games (game_name, game_logotip, game_genre, game_players) VALUES (?, ?, ?, ?)`,
            [game.gameName, game.gameLogotip, game.gameGenre, game.gamePlayers]
        );
        if (result.insertId === 0) return new Game;
        return new Game(result.insertId, game.gameName, game.gameLogotip, game.gameGenre, game.gamePlayers);
        } catch (err) {
        this.logger.error("GameRepository", "create failed", err);
        return new Game;
        } finally { res.conn.release(); }
    }

    async update(id: number, fields: Partial<Game>): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;

        const fieldMap: Record<string, string> = {
            gameName: "game_name",
            gameGenre: "game_genre",
            gamePlayers: "players_per_team",
            gameLogotip: "game_logotip"
        }

        try {
            const entries = Object.entries(fields)
                .filter(([, v]) => v !== undefined)
                .map(([k,v]) => [fieldMap[k] ?? k, v]);
            
            if (entries.length === 0) return false;
            const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
            const values = entries.map(([, v]) => v);
            const [result] = await res.conn.execute<ResultSetHeader>(
                `UPDATE games SET ${setClause} WHERE game_id = ?`, [...values, id]
            );
            return result.affectedRows > 0;
            } catch (err) {
            this.logger.error("GameRepository", "update failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async delete(id: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
        const [result] = await res.conn.execute<ResultSetHeader>(
            `DELETE FROM games WHERE game_id = ?`, [id]
        );
        return result.affectedRows > 0;
        } catch (err) {
        this.logger.error("GameRepository", "delete failed", err);
        return false;
        } finally { res.conn.release(); }
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
        } finally { res.conn.release(); }
    }
}