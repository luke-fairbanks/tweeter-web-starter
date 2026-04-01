import { AuthToken, User } from "tweeter-shared";
import { AuthDAO } from "../dao/interfaces/AuthDAO";
import { UserDAO } from "../dao/interfaces/UserDAO";

export class UserService {
  public constructor(private userDAO: UserDAO, private authDAO: AuthDAO) {}

  private normalizeAlias(alias: string): string {
    return alias.startsWith("@") ? alias : `@${alias}`;
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return this.userDAO.getUserByAlias(this.normalizeAlias(alias));
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    return this.authDAO.login(this.normalizeAlias(alias), password);
  }

  public async logout(authToken: AuthToken): Promise<void> {
    return this.authDAO.logout(authToken);
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    return this.authDAO.register(
      firstName,
      lastName,
      this.normalizeAlias(alias),
      password,
      userImageBytes,
      imageFileExtension
    );
  }
}
