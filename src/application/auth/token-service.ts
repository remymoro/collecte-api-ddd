export interface TokenService {
  sign(payload: Record<string, unknown>): Promise<string>;
}
