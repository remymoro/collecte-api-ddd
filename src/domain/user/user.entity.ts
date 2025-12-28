import { NoActiveCenterError } from "./errors/no-active-center.error";
import { UserRole } from "./type/user-role.type";

export class User {
  constructor(
    readonly id: string,
    readonly username: string,
    readonly passwordHash: string,
    readonly role: UserRole,
    readonly activeCenterId: string | null,
  ) 
  {

  }

  ensureCanLogin(): void {
  if (!this.activeCenterId) {
    throw new NoActiveCenterError();
  }
}

}