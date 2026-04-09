import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { User } from "tweeter-shared";
import { TableNames } from "../../config/TableNames";
import { FollowDAO } from "../interfaces/FollowDAO";
import { DynamoDBClientFactory } from "./DynamoDBClientFactory";

type FollowItem = {
  followerAlias: string;
  followeeAlias: string;
};

type UserItem = {
  alias: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
};

export class DynamoDBFollowDAO implements FollowDAO {
  public async loadMoreFollowees(
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new QueryCommand({
        TableName: TableNames.follows,
        KeyConditionExpression: "followerAlias = :alias",
        ExpressionAttributeValues: {
          ":alias": userAlias,
        },
        ExclusiveStartKey: lastItem
          ? {
              followerAlias: userAlias,
              followeeAlias: lastItem.alias,
            }
          : undefined,
        Limit: pageSize,
      })
    );

    const aliases = (result.Items as FollowItem[] | undefined)?.map(
      (item) => item.followeeAlias
    );
    const users = await this.getUsersByAliases(aliases ?? []);
    return [users, result.LastEvaluatedKey !== undefined];
  }

  public async loadMoreFollowers(
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new QueryCommand({
        TableName: TableNames.follows,
        IndexName: "followee-index",
        KeyConditionExpression: "followeeAlias = :alias",
        ExpressionAttributeValues: {
          ":alias": userAlias,
        },
        ExclusiveStartKey: lastItem
          ? {
              followeeAlias: userAlias,
              followerAlias: lastItem.alias,
            }
          : undefined,
        Limit: pageSize,
      })
    );

    const aliases = (result.Items as FollowItem[] | undefined)?.map(
      (item) => item.followerAlias
    );
    const users = await this.getUsersByAliases(aliases ?? []);
    return [users, result.LastEvaluatedKey !== undefined];
  }

  public async getIsFollowerStatus(
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new GetCommand({
        TableName: TableNames.follows,
        Key: {
          followerAlias: user.alias,
          followeeAlias: selectedUser.alias,
        },
      })
    );

    return !!result.Item;
  }

  public async getFolloweeCount(user: User): Promise<number> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new QueryCommand({
        TableName: TableNames.follows,
        KeyConditionExpression: "followerAlias = :alias",
        ExpressionAttributeValues: {
          ":alias": user.alias,
        },
        Select: "COUNT",
      })
    );

    return result.Count ?? 0;
  }

  public async getFollowerCount(user: User): Promise<number> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new QueryCommand({
        TableName: TableNames.follows,
        IndexName: "followee-index",
        KeyConditionExpression: "followeeAlias = :alias",
        ExpressionAttributeValues: {
          ":alias": user.alias,
        },
        Select: "COUNT",
      })
    );

    return result.Count ?? 0;
  }

  public async follow(
    followerAlias: string,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const client = DynamoDBClientFactory.getDocumentClient();
    await client.send(
      new PutCommand({
        TableName: TableNames.follows,
        Item: {
          followerAlias,
          followeeAlias: userToFollow.alias,
        },
      })
    );

    const followerCount = await this.getFollowerCount(userToFollow);
    const followeeCount = await this.getFolloweeCount(userToFollow);
    return [followerCount, followeeCount];
  }

  public async unfollow(
    followerAlias: string,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const client = DynamoDBClientFactory.getDocumentClient();
    await client.send(
      new DeleteCommand({
        TableName: TableNames.follows,
        Key: {
          followerAlias,
          followeeAlias: userToUnfollow.alias,
        },
      })
    );

    const followerCount = await this.getFollowerCount(userToUnfollow);
    const followeeCount = await this.getFolloweeCount(userToUnfollow);
    return [followerCount, followeeCount];
  }

  private async getUsersByAliases(aliases: string[]): Promise<User[]> {
    if (aliases.length === 0) {
      return [];
    }

    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new BatchGetCommand({
        RequestItems: {
          [TableNames.users]: {
            Keys: aliases.map((alias) => ({ alias })),
          },
        },
      })
    );

    const userItems = (result.Responses?.[TableNames.users] ?? []) as UserItem[];
    const byAlias = new Map(userItems.map((item) => [item.alias, item]));

    return aliases
      .map((alias) => byAlias.get(alias))
      .filter((item): item is UserItem => !!item)
      .map(
        (item) =>
          new User(item.firstName, item.lastName, item.alias, item.imageUrl)
      );
  }
}
