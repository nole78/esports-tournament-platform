import { RowDataPacket } from 'mysql2';
import { Invite } from '../../../Domain/models/TeamInvite';
import { IInvitesRepositoryRead } from '../../../Domain/repositories/invites/IInvitesRepositoryRead';
import { ILoggerService } from '../../../Domain/services/logger/ILoggerService';
import { DbManager } from '../../connection/DbConnectionPool';
export class InvitesRepositoryRead implements IInvitesRepositoryRead{
    public constructor(
        private readonly db: DbManager,
        private readonly logger : ILoggerService,
    ){}

    private map(r: RowDataPacket) : Invite{
        return new Invite(r.user_id, r.team_id, r.invited_at, r.status);
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
                `SELECT * FROM team_invites WHERE user_id = ?`, [userId]
            );

            return rows.map((r) => this.map(r));
        }catch(err){
            this.logger.error("InvitesRepository", "findByUserId", err);
            return [];
        }
        finally{ res.conn.release();}
    }
    async find(teamId: number, userId: number): Promise<Invite> {
        const res = await this.db.getReadConnection();
        if (!res) return new Invite;

        try{
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM team_invites WHERE team_id = ? AND user_id = ?`, [teamId,userId]
            );

            return rows.length > 0 ? this.map(rows[0]) : new Invite;
        }catch(err){
            this.logger.error("InvitesRepository", "findByUserId", err);
            return new Invite;
        }
        finally{ res.conn.release();}
    }
}