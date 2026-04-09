import bcrypt from "bcryptjs";
import { AuthToken, User } from "tweeter-shared";
import { ImageDAO } from "../dao/interfaces/ImageDAO";
import { SessionDAO } from "../dao/interfaces/SessionDAO";
import { UserDAO } from "../dao/interfaces/UserDAO";

export class UserService {
  public constructor(
    private userDAO: UserDAO,
    private sessionDAO: SessionDAO,
    private imageDAO: ImageDAO
  ) {}

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
    const normalizedAlias = this.normalizeAlias(alias);
    const user = await this.userDAO.getUserByAlias(normalizedAlias);
    if (!user) {
      throw new Error("[BadRequest] Invalid alias or password");
    }

    const passwordHash = await this.userDAO.getPasswordHash(normalizedAlias);
    if (!passwordHash) {
      throw new Error("[ServerError] User credentials are missing");
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      throw new Error("[BadRequest] Invalid alias or password");
    }

    const authToken = await this.sessionDAO.createSession(normalizedAlias);
    return [user, authToken];
  }

  public async logout(authToken: AuthToken): Promise<void> {
    return this.sessionDAO.deleteSession(authToken.token);
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const normalizedAlias = this.normalizeAlias(alias);

    const existingUser = await this.userDAO.getUserByAlias(normalizedAlias);
    if (existingUser) {
      throw new Error("[BadRequest] Alias already exists");
    }

    const fileName = `${normalizedAlias.replace("@", "")}-${Date.now()}.${imageFileExtension}`;
    const imageUrl = await this.imageDAO.putImage(
      fileName,
      Buffer.from(userImageBytes).toString("base64")
    );

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User(firstName, lastName, normalizedAlias, imageUrl);
    await this.userDAO.putUser(user, passwordHash);

    const authToken = await this.sessionDAO.createSession(normalizedAlias);
    return [user, authToken];
  }
}
