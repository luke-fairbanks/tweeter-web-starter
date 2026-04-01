import {
  BatchWriteCommand,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthToken, Status, User } from "tweeter-shared";
import { TableNames } from "../../config/TableNames";
import { StatusDAO } from "../interfaces/StatusDAO";
import { DynamoDBClientFactory } from "./DynamoDBClientFactory";

type StatusItem = {
  userAlias: string;
  timestamp: number;
  post: string;
  authorAlias: string;
  authorFirstName: string;
  authorLastName: string;
  authorImageUrl: string;
};

type FollowItem = {
  followerAlias: string;
  followeeAlias: string;
};

export class DynamoDBStatusDAO implements StatusDAO {
  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new QueryCommand({
        TableName: TableNames.statuses,
        KeyConditionExpression: "userAlias = :alias",
        ExpressionAttributeValues: {
          ":alias": userAlias,
        },
        ScanIndexForward: false,
        Limit: pageSize,
        ExclusiveStartKey: lastItem
          ? {
              userAlias,
              timestamp: lastItem.timestamp,
            }
          : undefined,
      })
    );

    const statuses = ((result.Items as StatusItem[] | undefined) ?? []).map((item) =>
      this.toStatus(item)
    );

    return [statuses, result.LastEvaluatedKey !== undefined];
  }

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const result = await client.send(
      new QueryCommand({
        TableName: TableNames.feeds,
        KeyConditionExpression: "userAlias = :alias",
        ExpressionAttributeValues: {
          ":alias": userAlias,
        },
        ScanIndexForward: false,
        Limit: pageSize,
        ExclusiveStartKey: lastItem
          ? {
              userAlias,
              timestamp: lastItem.timestamp,
            }
          : undefined,
      })
    );

    const statuses = ((result.Items as StatusItem[] | undefined) ?? []).map((item) =>
      this.toStatus(item)
    );

    return [statuses, result.LastEvaluatedKey !== undefined];
  }

  public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
    const item: StatusItem = {
      userAlias: newStatus.user.alias,
      timestamp: newStatus.timestamp,
      post: newStatus.post,
      authorAlias: newStatus.user.alias,
      authorFirstName: newStatus.user.firstName,
      authorLastName: newStatus.user.lastName,
      authorImageUrl: newStatus.user.imageUrl,
    };

    const client = DynamoDBClientFactory.getDocumentClient();

    await client.send(
      new PutCommand({
        TableName: TableNames.statuses,
        Item: item,
      })
    );

    const followers = await this.getFollowerAliases(newStatus.user.alias);
    if (followers.length === 0) {
      return;
    }

    for (let i = 0; i < followers.length; i += 25) {
      const chunk = followers.slice(i, i + 25);
      await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [TableNames.feeds]: chunk.map((followerAlias) => ({
              PutRequest: {
                Item: {
                  ...item,
                  userAlias: followerAlias,
                },
              },
            })),
          },
        })
      );
    }
  }

  private async getFollowerAliases(followeeAlias: string): Promise<string[]> {
    const client = DynamoDBClientFactory.getDocumentClient();
    const aliases: string[] = [];
    let exclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const result = await client.send(
        new QueryCommand({
          TableName: TableNames.follows,
          IndexName: "followee-index",
          KeyConditionExpression: "followeeAlias = :alias",
          ExpressionAttributeValues: {
            ":alias": followeeAlias,
          },
          ExclusiveStartKey: exclusiveStartKey,
        })
      );

      const items = (result.Items as FollowItem[] | undefined) ?? [];
      aliases.push(...items.map((item) => item.followerAlias));
      exclusiveStartKey = result.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return aliases;
  }

  private toStatus(item: StatusItem): Status {
    const user = new User(
      item.authorFirstName,
      item.authorLastName,
      item.authorAlias,
      item.authorImageUrl
    );

    return new Status(item.post, user, item.timestamp);
  }
}
