export class UserPasswordDto {
  constructor(
    public newPassword: string = "",
    public oldPassword: string = "",
  ) {}
}