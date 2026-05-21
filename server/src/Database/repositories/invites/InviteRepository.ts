import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Invite } from "../../../Domain/models/TeamInvite";
import { IInvitesRepository } from "../../../Domain/repositories/invites/IInvitesRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { Result } from '../../../Domain/common/Result';
import { TeamInviteStatus } from "../../../Domain/enums/TeamInviteStatus";
import { handleResult } from '../../../WebAPI/mappers/ResultMapper';

export class InviteRepository implements IInvitesRepository{
    public constructor(
        private readonly db: DbManager,
        private readonly logger : ILoggerService,
    ){}

    private map(r: RowDataPacket) : Invite{
        return new Invite(r.userId, r.teamId, r.invited_at, r.status);
    }

    async findByTeamId(teamId: number): Promise<Invite[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];

        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM team_invites WHERE teamId = ?`, [teamId]
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
                `SELECT * FROM team_invites WHERE userId = ?`, [userId]
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
            `INSERT INTO team_invites (userId, teamId, status) VALUES (?, ?, ?)`, [invite.userId, invite.teamId, invite.status]
        );
        if (result.affectedRows === 0) return new Invite;

        const [row] = await res.conn.execute<RowDataPacket[]>(
            `SELECT * FROM team_invites WHERE teamId=? AND userId=?`, [invite.teamId, invite.userId]
        );
        return this.map(row[0]);
        }catch (err){
            this.logger.error("InvitesRepository", "create", err);
            return new Invite;
        }finally{res.conn.release();}
    }

    async delete(teamId: number, userId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try{
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM team_invites WHERE userId = ? AND teamId = ?`, [userId, teamId]
            );
            return result.affectedRows > 0;

        }catch(err){
            this.logger.error("InviteRepository", "delete failed", err);
            return false;
        }finally{res.conn.release();}
    }

    async update(teamId: number, userId : number, status: TeamInviteStatus): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;

        try{
            const [row] = await res.conn.execute<ResultSetHeader>(
                `UPDATE team_invites SET status = ? WHERE teamId = ? AND userId = ?`, [status, teamId, userId]
            );
            return row.affectedRows>0;
        }catch(err){
            this.logger.error("InviteRepository", "update failed", err);
            return false;
        }finally{ res.conn.release();}
    }
    async find(teamId: number, userId: number): Promise<Invite> {
        const res = await this.db.getReadConnection();
        if (!res) return new Invite;

        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM team_invites WHERE teamId = ? AND userId = ?`, [teamId,userId]
            );

            return rows.length > 0 ? this.map(rows[0]) : new Invite;
        }catch(err){
            this.logger.error("InvitesRepository", "findByUserId", err);
            return new Invite;
        }
        finally{ res.conn.release();}
    }
}