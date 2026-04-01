import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { AwsConfig } from "../../config/TableNames";

export class DynamoDBClientFactory {
  private static dynamoClient = new DynamoDBClient({ region: AwsConfig.region });
  private static documentClient = DynamoDBDocumentClient.from(
    DynamoDBClientFactory.dynamoClient
  );

  public static getDocumentClient(): DynamoDBDocumentClient {
    return DynamoDBClientFactory.documentClient;
  }
}
