import { AuthToken, FakeData } from "tweeter-shared";
import { SessionDAO } from "../interfaces/SessionDAO";

export class FakeSessionDAO implements SessionDAO {
  public async createSession(alias: string): Promise<AuthToken> {
    return FakeData.instance.authToken;
  }

  public async validateSession(token: string): Promise<boolean> {
    return true;
  }

  public async resolveAlias(token: string): Promise<string | null> {
    return FakeData.instance.firstUser?.alias ?? null;
  }

  public async deleteSession(token: string): Promise<void> {
    return;
  }
}
