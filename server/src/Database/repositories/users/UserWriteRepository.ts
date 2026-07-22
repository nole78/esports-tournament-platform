import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IUserWriteRepository } from "../../../Domain/repositories/users/IUserWriteRepository";
import { User } from "../../../Domain/models/User";
import { UserRole } from "../../../Domain/enums/UserRole";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class UserWriteRepository implements IUserWriteRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
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
                .filter(([, v]) => v)
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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }
}
