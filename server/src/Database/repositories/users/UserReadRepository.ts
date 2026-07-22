import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IUserReadRepository } from "../../../Domain/repositories/users/IUserReadRepository";
import { User } from "../../../Domain/models/User";
import { UserRole } from "../../../Domain/enums/UserRole";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class UserReadRepository implements IUserReadRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): User {
    return new User(r.id, r.gamer_tag, r.email, r.full_name, r.role as UserRole, r.passwordHash, r.profile_picture ,r.isActive);
  }

  async findById(id: number): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [id]);
      return rows.length > 0 ? this.map(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findById failed", err);
      return new User();
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }

  async findByIds(ids: number[]): Promise<User[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const setClause = ids.map(() => "?").join(",");
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM users WHERE id IN (${setClause})`, ids);
      return rows.map(r => this.map(r));
    } catch (err) {
      this.logger.error("UserRepository", "findByIds failed", err);
      return [];
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }

  async findByUsername(username: string): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM users WHERE gamer_tag = ?`, [username]);
      return rows.length > 0 ? this.map(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findByUsername failed", err);
      return new User();
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }

  async findByEmail(email: string): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM users WHERE email = ?`, [email]);
      return rows.length > 0 ? this.map(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findByEmail failed", err);
      return new User();
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }

  async findAll(): Promise<User[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM users ORDER BY id ASC`);
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("UserRepository", "findAll failed", err);
      return [];
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }
  
  async exists(id: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as cnt FROM users WHERE id = ?`, [id]
      );
      return (rows[0]?.cnt ?? 0) > 0;
    } catch (err) {
      this.logger.error("UserRepository", "exists failed", err);
      return false;
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }
}
