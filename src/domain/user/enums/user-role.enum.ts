export const UserRole = {
  ADMIN: 'ADMIN',
  BENEVOLE: 'BENEVOLE',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
