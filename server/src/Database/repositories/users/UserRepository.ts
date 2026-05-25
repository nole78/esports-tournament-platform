import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { UserRole } from "../../../Domain/enums/UserRole";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class UserRepository implements IUserRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): User {
    return new User(r.id, r.gamer_tag, r.email, r.full_name, r.role as UserRole, r.passwordHash, r.profile_picture ,r.isActive);
  }

  async create(user: User): Promise<User> {
    const res = await this.db.getWriteConnection();
    if (!res) return new User();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO users (full_name, gamer_tag, email, role, passwordHash, profile_picture) VALUES (?, ?, ?, ?, ?, ?)`,
        [user.fullName, user.gamerTag, user.email, user.role, user.passwordHash, user.profilePicture]
      );
      if (result.insertId === 0) return new User();
      return new User(result.insertId, user.gamerTag, user.email, user.fullName, user.role, user.passwordHash);
    } catch (err) {
      this.logger.error("UserRepository", "create failed", err);
      return new User();
    } finally { res.conn.release(); }
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
    } finally { res.conn.release(); }
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
    } finally { res.conn.release(); }
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
    } finally { res.conn.release(); }
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
    } finally { res.conn.release(); }
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
    } finally { res.conn.release(); }
  }

  async update(id:number ,fields: Partial<User>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    const fieldMap: Record<string, string> = {
            fullName: "full_name",
            gamerTag: "gamer_tag",
            email: "email",
            passwordHash: "passwordHash",
            role: "role",
            profilePicture: "profile_picture"
        }

    try {
      const entries = Object.entries(fields)
                .filter(([, v]) => v !== undefined)
                .map(([k,v]) => [fieldMap[k] ?? k, v]);  

      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async logOut(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE users SET isActive = 0 WHERE id = ?`, [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserRepository", "log out failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async logIn(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE users SET isActive = 1 WHERE id = ?`, [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserRepository", "log in failed", err);
      return false;
    } finally { res.conn.release(); }
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
    } finally { res.conn.release(); }
  }
}
