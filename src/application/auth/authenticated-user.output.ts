import { UserRole } from '@domain/user/type/user-role.type';

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
  activeCenterId: string;
};
