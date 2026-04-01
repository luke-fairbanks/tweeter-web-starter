import { SessionDAO } from "../dao/interfaces/SessionDAO";

export class AuthorizationService {
  public constructor(private sessionDAO: SessionDAO) {}

  public async verifySession(token: string): Promise<void> {
    const isValid = await this.sessionDAO.validateSession(token);
    if (!isValid) {
      throw new Error("[Unauthorized] Invalid or expired auth token");
    }
  }
}
