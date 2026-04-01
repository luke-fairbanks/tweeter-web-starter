import { FakeData, User } from "tweeter-shared";
import { UserDAO } from "../interfaces/UserDAO";

export class FakeUserDAO implements UserDAO {
  public async getUserByAlias(alias: string): Promise<User | null> {
    return FakeData.instance.findUserByAlias(alias);
  }

  public async putUser(user: User, passwordHash: string): Promise<void> {
    return;
  }

  public async getPasswordHash(alias: string): Promise<string | null> {
    return null;
  }
}
