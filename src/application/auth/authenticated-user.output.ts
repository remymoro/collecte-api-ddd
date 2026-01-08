import { UserRole } from '@domain/user/type/user-role.type';

export type AuthenticatedUser = {
  userId: string;
  role: UserRole;
  centerId?: string; // optionnel selon le rôle
};
