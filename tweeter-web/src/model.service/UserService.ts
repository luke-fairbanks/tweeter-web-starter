import { User } from "tweeter-shared/dist/model/domain/User";
import { AuthToken } from "tweeter-shared";
import { FakeData } from "tweeter-shared";
import { Buffer } from "buffer";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class UserService implements Service{
  private facade = new ServerFacade();
  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return await this.facade.getUser({ token: authToken.token, alias });
  };

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    return await this.facade.login({ alias, password });
  };

  public async logout(authToken: AuthToken): Promise<void> {
    return await this.facade.logout({ token: authToken.token });
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const imageStringBase64: string = Buffer.from(userImageBytes).toString("base64");
    return await this.facade.register({
      firstName,
      lastName,
      alias,
      password,
      userImageBytes: imageStringBase64,
      imageFileExtension
    });
  };
}