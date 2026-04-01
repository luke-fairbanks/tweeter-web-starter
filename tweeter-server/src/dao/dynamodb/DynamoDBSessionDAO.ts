import { DeleteCommand, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AuthToken } from "tweeter-shared";
import { TableNames } from "../../config/TableNames";
import { SessionDAO } from "../interfaces/SessionDAO";
import { DynamoDBClientFactory } from "./DynamoDBClientFactory";

type SessionItem = {
  token: string;
  alias: string;
  createdAt: number;
  expiresAt: number;
};

export class DynamoDBSessionDAO implements SessionDAO {
  // Sessions are valid for 10 minutes, and are refreshed on each validation
  private static readonly SESSION_DURATION_MS = 1000 * 60 * 10;

  public async createSession(alias: string): Promise<AuthToken> {
    const authToken = AuthToken.Generate();
    const createdAt = Date.now();
    const expiresAt = createdAt + DynamoDBSessionDAO.SESSION_DURATION_MS;

    const client = DynamoDBClientFactory.getDocumentClient();
    await client.send(
      new PutCommand({
        TableName: TableNames.sessions,
        Item: {
          token: authToken.token,
          alias,
          createdAt,
          expiresAt,
        },
      })
    );

    return authToken;
  }

  public async validateSession(token: string): Promise<boolean> {
    const session = await this.getSession(token);
    if (!session) {
      return false;
    }

    if (session.expiresAt <= Date.now()) {
      return false;
    }

    const now = Date.now();
    const refreshedExpiry = now + DynamoDBSessionDAO.SESSION_DURATION_MS;
    const client = DynamoDBClientFactory.getDocumentClient();
    await client.send(
      new UpdateCommand({
        TableName: TableNames.sessions,
        Key: { token },
        UpdateExpression: "SET expiresAt = :expiresAt",
        ExpressionAttributeValues: {
          ":expiresAt": refreshedExpiry,
        },
      })
    );

    return true;
  }

  public async resolveAlias(token: string): Promise<string | null> {
    const session = await this.getSession(token);
    if (!session || session.expiresAt <= Date.now()) {
      return null;
    }

    return session.alias;
  }

  private async getSession(token: string): Promise<SessionItem | null> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new GetCommand({
        TableName: TableNames.sessions,
        Key: { token },
      })
    );

    if (!result.Item) {
      return null;
    }

    return result.Item as SessionItem;
  }

  public async deleteSession(token: string): Promise<void> {
    const client = DynamoDBClientFactory.getDocumentClient();
    await client.send(
      new DeleteCommand({
        TableName: TableNames.sessions,
        Key: { token },
      })
    );
  }
}
