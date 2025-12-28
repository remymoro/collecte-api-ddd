export type JwtPayload = {
  sub: string;
  role: 'ADMIN' | 'BENEVOLE';
  activeCenterId: string;
  iat: number;
  exp: number;
};
