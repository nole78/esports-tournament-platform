import { IUserService } from "../../Domain/services/users/IUserService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { UserInfoDto } from "../../Domain/DTOs/users/UserInfoDto";
import { User } from "../../Domain/models/User";
import bcrypt from "bcryptjs";

export class UserService implements IUserService {
  private readonly saltRounds = parseInt(process.env.SALT_ROUNDS ?? "10", 10);
  public constructor(private readonly userRepo: IUserRepository) {}

  async getAll(): Promise<UserDto[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => new UserDto(u.id, u.gamerTag, u.email, u.role, u.profilePicture, u.isActive));
  }

  async getById(id: number): Promise<UserDto | null> {
    const u = await this.userRepo.findById(id);
    if (u.id === 0) return null;
    return new UserDto(u.id, u.gamerTag, u.email, u.role, u.profilePicture, u.isActive);
  }

  async deactivate(id: number): Promise<boolean> {
    return this.userRepo.deactivate(id);
  }

  async getInfo(id: number): Promise<UserInfoDto | null> {
    const u = await this.userRepo.findById(id);
    if (u.id === 0) return null;
    return new UserInfoDto(u.gamerTag,u.email,u.fullName,u.passwordHash,u.profilePicture);
  }

  async update(id:number, fields: Partial<UserInfoDto>) : Promise<boolean>{

    if(fields.gamerTag)
    {
      const byName = await this.userRepo.findByUsername(fields.gamerTag);
      if (byName.id == id) {
        return false;
      }
    }
    if(fields.email)
    {
      const byEmail = await this.userRepo.findByEmail(fields.email);
      if (byEmail.id == id) 
      {
        return false;
      }
    }
    if(fields.password)
    {
      const hash = await bcrypt.hash(fields.password, this.saltRounds).catch(() => "");
        if (!hash) return false;
      return await this.userRepo.update(id,{gamerTag: fields.gamerTag,email: fields.email,fullName: fields.fullName,profilePicture: fields.profilePicture, passwordHash: hash})
    }
    return await this.userRepo.update(id,{gamerTag: fields.gamerTag,email: fields.email,fullName: fields.fullName,profilePicture: fields.profilePicture})
  }
}
