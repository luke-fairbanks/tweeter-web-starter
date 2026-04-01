import { Env } from "./Env";

export const TableNames = {
  users: Env.get("USERS_TABLE_NAME", "tweeter-users"),
  follows: Env.get("FOLLOWS_TABLE_NAME", "tweeter-follows"),
  statuses: Env.get("STATUSES_TABLE_NAME", "tweeter-statuses"),
  feeds: Env.get("FEEDS_TABLE_NAME", "tweeter-feeds"),
  sessions: Env.get("SESSIONS_TABLE_NAME", "tweeter-sessions"),
};

export const AwsConfig = {
  region: Env.get("AWS_REGION", "us-west-2"),
  bucketName: Env.get("PROFILE_IMAGE_BUCKET_NAME", "tweeter-profile-images"),
};
