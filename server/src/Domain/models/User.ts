import { UserRole } from "../enums/UserRole";

export class User {
  constructor(
    public id: number        = 0,
    public gamerTag: string = "",
    public email: string     = "",
    public fullName: string  = "",
    public role: UserRole    = UserRole.PLAYER,
    public passwordHash: string = "",
    public profilePicture: string = "",
    public isActive: number  = 1,
    public createdAt : Date = new Date(),
    public updatedAt : Date = new Date(),
    public idxGamerTag : number = 0,
    public idxEmail : number = 0,
  ) {}
}

