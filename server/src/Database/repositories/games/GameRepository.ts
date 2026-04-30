import { ResultSetHeader, RowDataPacket } from "mysql2";
import { CreateGameDto } from "../../../Domain/DTOs/games/CreateGameDto";
import { GameDto } from "../../../Domain/DTOs/games/GameDto";
import { Game } from "../../../Domain/models/Game";
import { IGameRepository } from "../../../Domain/repositories/games/IGameRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";


export class GameRepository implements IGameRepository{
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ){}

      private map(r: RowDataPacket): GameDto {
        return new GameDto(r.game_id, r.game_name, r.game_logotip, r.game_genre, r.game_players);
      }

    async findById(id: number): Promise<GameDto | null> {
        const res = await this.db.getReadConnection();
        if(!res) return null;
        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM games WHERE game_id = ?`,[id]);
            return rows.length > 0 ? this.map(rows[0]) : null;
        }
        catch (err) {
            this.logger.error("GameRepository","findById failed",err);
            return null;
        }
        finally{ res.conn.release();}
    }

    async findByName(name: string): Promise<GameDto | null> {
        const res = await this.db.getReadConnection();
        if(!res) return null;
        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM games WHERE game_name = ?`,[name]);
            return rows.length > 0 ? this.map(rows[0]) : null;
        }
        catch (err) {
            this.logger.error("GameRepository","findByName failed",err);
            return null;
        }
        finally{ res.conn.release();}
    }
    
    async findAll(page = 1, limit = 20): Promise<GameDto[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
            const offset = (page - 1) * limit;
        try {
            //const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM games ORDER BY game_id LIMIT ? OFFSET ?`, [limit,offset]);
            const [rows] = await res.conn.query<RowDataPacket[]>(`SELECT * FROM games ORDER BY game_id LIMIT ? OFFSET ?`, [limit,offset]);
            return rows.map((r) => this.map(r));
        } catch (err) {
            this.logger.error("GameRepository", "findAll failed", err);
            return [];
        } finally { res.conn.release(); }
        }

    async create(dto: CreateGameDto): Promise<Game> {
                const res = await this.db.getWriteConnection();
        if (!res) return new Game();
        try {
        const [result] = await res.conn.execute<ResultSetHeader>(
            `INSERT INTO games (game_name, game_logotip, game_genre, game_players) VALUES (?, ?, ?, ?)`,
            [dto.gameName, dto.gameLogotip, dto.gameGenre, dto.gamePlayers]
        );
        if (result.insertId === 0) return new Game();
        return new Game(result.insertId, dto.gameName, dto.gameLogotip, dto.gameGenre, dto.gamePlayers);
        } catch (err) {
        this.logger.error("GameRepository", "create failed", err);
        return new Game();
        } finally { res.conn.release(); }
    }

    async update(id: number, fields: Partial<Game>): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;

        const fieldMap: Record<string, string> = {
            gameName: "game_name",
            gameGenre: "game_genre",
            gamePlayers: "game_players",
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

}