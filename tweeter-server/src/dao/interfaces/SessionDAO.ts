import { AuthToken } from "tweeter-shared";

export interface SessionDAO {
  createSession(alias: string): Promise<AuthToken>;
  validateSession(token: string): Promise<boolean>;
  resolveAlias(token: string): Promise<string | null>;
  deleteSession(token: string): Promise<void>;
}
