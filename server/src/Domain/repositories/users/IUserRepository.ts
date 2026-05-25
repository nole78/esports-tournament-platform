import { User } from "../../models/User";

export interface IUserRepository {
  findById(id: number): Promise<User>;
  findByIds(ids: number[]): Promise<User[]>;
  findByUsername(username: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(id:number ,fields: Partial<User>): Promise<boolean>;
  logOut(id: number): Promise<boolean>;
  logIn(id: number): Promise<boolean>;
}
