import { User } from "../../models/User";

export interface IUserWriteRepository {
  create(user: User): Promise<User>;
  update(id:number ,fields: Partial<User>): Promise<boolean>;
  logOut(id: number): Promise<boolean>;
  logIn(id: number): Promise<boolean>;
}
