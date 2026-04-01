import { User } from "tweeter-shared";

export interface UserDAO {
  getUserByAlias(alias: string): Promise<User | null>;
  putUser(user: User, passwordHash: string): Promise<void>;
  getPasswordHash(alias: string): Promise<string | null>;
}
