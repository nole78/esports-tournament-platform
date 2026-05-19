import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Invite } from "../../../Domain/models/Invite";
import { IInvitesRepository } from "../../../Domain/repositories/invites/IInvitesRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { Result } from '../../../Domain/common/Result';

export class InviteRepository implements IInvitesRepository{
    public constructor(
        private readonly db: DbManager,
        private readonly logger : ILoggerService,
    ){}

    private map(r: RowDataPacket) : Invite{
        return new Invite(r.user_id, r.team_id, r.invited_at);
    }

    async findByTeamId(teamId: number): Promise<Invite[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];

        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM invites WHERE team_id = ?`, [teamId]
            );
            return rows.map((r) => this.map(r));
        } catch (err){
            this.logger.error("InivteRepository", "findByTeamId failed", err);
            return [];
        }
        finally { res.conn.release();}
    }

    async findByUserId(userId: number): Promise<Invite[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];

        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM invites WHERE user_id = ?`, [userId]
            );

            return rows.map((r) => this.map(r));
        }catch(err){
            this.logger.error("InvitesRepository", "findByUserId", err);
            return [];
        }
        finally{ res.conn.release();}
    }

    async create(invite: Invite): Promise<Invite> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Invite;
        try{
        const [result] = await res.conn.execute<ResultSetHeader>(
            `INSERT INTO invites (user_id, team_id) VALUES (?, ?)`, [invite.user_id, invite.team_id]
        );
        if (result.affectedRows === 0) return new Invite;

        const [row] = await res.conn.execute<RowDataPacket[]>(
            `SELECT * FROM invites WHERE team_id=? AND user_id=?`, [invite.team_id, invite.user_id]
        );
        return this.map(row[0]);
        }catch (err){
            this.logger.error("InvitesRepository", "create", err);
            return new Invite;
        }finally{res.conn.release();}
    }

    async delete(userId: number, teamId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try{
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM invites WHERE user_id = ? AND team_id = ?`, [userId, teamId]
            );
            return result.affectedRows > 0;

        }catch(err){
            this.logger.error("InviteRepository", "delete failed", err);
            return false;
        }finally{res.conn.release();}
    }
}