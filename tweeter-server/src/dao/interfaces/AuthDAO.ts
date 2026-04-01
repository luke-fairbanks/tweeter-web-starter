import { AuthToken, User } from "tweeter-shared";

export interface AuthDAO {
  login(alias: string, password: string): Promise<[User, AuthToken]>;
  logout(authToken: AuthToken): Promise<void>;
  register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]>;
}
