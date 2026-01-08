export type JwtPayload = {
  sub: string;
  role: 'ADMIN' | 'BENEVOLE';
  centerId: string;
  iat: number;
  exp: number;
};
