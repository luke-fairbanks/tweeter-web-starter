import { User, AuthToken, FakeData } from "tweeter-shared";

export class UserService {
  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return FakeData.instance.findUserByAlias(alias);
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    const user = FakeData.instance.firstUser;
    if (user === null) {
      throw new Error("Invalid alias or password");
    }
    return [user, FakeData.instance.authToken];
  }

  public async logout(authToken: AuthToken): Promise<void> {
    // Logic for logout
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const user = FakeData.instance.firstUser;
    if (user === null) {
      throw new Error("Invalid registration");
    }
    return [user, FakeData.instance.authToken];
  }
}
