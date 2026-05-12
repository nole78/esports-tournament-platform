export class UserPasswordDto {
  newPassword: string;
  oldPassword: string;

  constructor(newPassword = "", oldPassword = "") {
    this.newPassword = newPassword;
    this.oldPassword = oldPassword;
  }
}