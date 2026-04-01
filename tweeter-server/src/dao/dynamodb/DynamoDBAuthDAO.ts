import bcrypt from "bcryptjs";
import { AuthDAO } from "../interfaces/AuthDAO";
import { UserDAO } from "../interfaces/UserDAO";
import { SessionDAO } from "../interfaces/SessionDAO";
import { ImageDAO } from "../interfaces/ImageDAO";
import { AuthToken, User } from "tweeter-shared";

export class DynamoDBAuthDAO implements AuthDAO {
  public constructor(
    private userDAO: UserDAO,
    private sessionDAO: SessionDAO,
    private imageDAO: ImageDAO
  ) {}

  public async login(alias: string, password: string): Promise<[User, AuthToken]> {
    const user = await this.userDAO.getUserByAlias(alias);
    if (!user) {
      throw new Error("[BadRequest] Invalid alias or password");
    }

    const passwordHash = await this.userDAO.getPasswordHash(alias);
    if (!passwordHash) {
      throw new Error("[ServerError] User credentials are missing");
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      throw new Error("[BadRequest] Invalid alias or password");
    }

    const authToken = await this.sessionDAO.createSession(alias);
    return [user, authToken];
  }

  public async logout(authToken: AuthToken): Promise<void> {
    await this.sessionDAO.deleteSession(authToken.token);
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const existingUser = await this.userDAO.getUserByAlias(alias);
    if (existingUser) {
      throw new Error("[BadRequest] Alias already exists");
    }

    const fileName = `${alias.replace("@", "")}-${Date.now()}.${imageFileExtension}`;
    const imageUrl = await this.imageDAO.putImage(
      fileName,
      Buffer.from(userImageBytes).toString("base64")
    );

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User(firstName, lastName, alias, imageUrl);
    await this.userDAO.putUser(user, passwordHash);

    const authToken = await this.sessionDAO.createSession(alias);
    return [user, authToken];
  }
}
