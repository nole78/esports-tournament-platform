import { ResultSetHeader, RowDataPacket } from "mysql2";
import { CreateGameDto } from "../../../Domain/DTOs/games/CreateGameDto";
import { Game } from "../../../Domain/models/Game";
import { IGameWriteRepository } from "../../../Domain/repositories/games/IGameWriteRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";

export class GameWriteRepository implements IGameWriteRepository{
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ){}

    async create(game: Game): Promise<Game> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Game;
        try {
        const [result] = await res.conn.execute<ResultSetHeader>(
            `INSERT INTO games (game_name, game_logotip, game_genre, players_per_team) VALUES (?, ?, ?, ?)`,
            [game.gameName, game.gameLogotip, game.gameGenre, game.gamePlayers]
        );
        if (result.insertId === 0) return new Game;
        return new Game(result.insertId, game.gameName, game.gameLogotip, game.gameGenre, game.gamePlayers);
        } catch (err) {
        this.logger.error("GameRepository", "create failed", err);
        return new Game;
        } finally { if(!res.isTransaction)
        res.conn.release();; }
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
        } finally { if(!res.isTransaction)
        res.conn.release();; }
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
        } finally { if(!res.isTransaction)
        res.conn.release();; }
    }
}