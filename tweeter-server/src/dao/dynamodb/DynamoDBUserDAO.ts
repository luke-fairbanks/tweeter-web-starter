import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "tweeter-shared";
import { TableNames } from "../../config/TableNames";
import { UserDAO } from "../interfaces/UserDAO";
import { DynamoDBClientFactory } from "./DynamoDBClientFactory";

type UserItem = {
  alias: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  passwordHash?: string;
};

export class DynamoDBUserDAO implements UserDAO {
  public async getUserByAlias(alias: string): Promise<User | null> {
    const client = DynamoDBClientFactory.getDocumentClient();

    const result = await client.send(
      new GetCommand({
        TableName: TableNames.users,
        Key: { alias },
      })
    );

    if (!result.Item) {
      return null;
    }

    const item = result.Item as UserItem;
    return new User(item.firstName, item.lastName, item.alias, item.imageUrl);
  }

  public async putUser(user: User, passwordHash: string): Promise<void> {
    const client = DynamoDBClientFactory.getDocumentClient();

    await client.send(
      new PutCommand({
        TableName: TableNames.users,
        Item: {
          alias: user.alias,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          passwordHash,
        },
      })
    );
  }

  public async getPasswordHash(alias: string): Promise<string | null> {
    const client = DynamoDBClientFactory.getDocumentClient();

    const result = await client.send(
      new GetCommand({
        TableName: TableNames.users,
        Key: { alias },
      })
    );

    if (!result.Item) {
      return null;
    }

    const item = result.Item as UserItem;
    return item.passwordHash ?? null;
  }
}
