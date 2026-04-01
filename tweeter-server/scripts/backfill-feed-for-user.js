const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  CloudFormationClient,
  DescribeStackResourceCommand,
} = require("@aws-sdk/client-cloudformation");
const {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  GetCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-west-2";
const STACK_NAME = process.env.STACK_NAME || "tweeter-server";
const RAW_TARGET_ALIAS = process.env.TARGET_ALIAS || "@luke";
const TARGET_ALIAS = RAW_TARGET_ALIAS.startsWith("@")
  ? RAW_TARGET_ALIAS
  : `@${RAW_TARGET_ALIAS}`;

let USERS_TABLE_NAME = process.env.USERS_TABLE_NAME;
let FOLLOWS_TABLE_NAME = process.env.FOLLOWS_TABLE_NAME;
let STATUSES_TABLE_NAME = process.env.STATUSES_TABLE_NAME;
let FEEDS_TABLE_NAME = process.env.FEEDS_TABLE_NAME;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const cfn = new CloudFormationClient({ region: REGION });

async function resolveTableName(logicalResourceId) {
  const result = await cfn.send(
    new DescribeStackResourceCommand({
      StackName: STACK_NAME,
      LogicalResourceId: logicalResourceId,
    })
  );

  return result.StackResourceDetail?.PhysicalResourceId;
}

async function ensureTableNames() {
  USERS_TABLE_NAME = USERS_TABLE_NAME || (await resolveTableName("UsersTable"));
  FOLLOWS_TABLE_NAME =
    FOLLOWS_TABLE_NAME || (await resolveTableName("FollowsTable"));
  STATUSES_TABLE_NAME =
    STATUSES_TABLE_NAME || (await resolveTableName("StatusesTable"));
  FEEDS_TABLE_NAME = FEEDS_TABLE_NAME || (await resolveTableName("FeedsTable"));

  if (
    !USERS_TABLE_NAME ||
    !FOLLOWS_TABLE_NAME ||
    !STATUSES_TABLE_NAME ||
    !FEEDS_TABLE_NAME
  ) {
    throw new Error(
      "Unable to resolve required table names. Ensure stack is deployed or provide env vars."
    );
  }
}

async function ensureTargetUserExists() {
  const result = await ddb.send(
    new GetCommand({
      TableName: USERS_TABLE_NAME,
      Key: { alias: TARGET_ALIAS },
    })
  );

  if (!result.Item) {
    throw new Error(`User ${TARGET_ALIAS} not found in ${USERS_TABLE_NAME}.`);
  }
}

async function getFollowees(alias) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: FOLLOWS_TABLE_NAME,
      KeyConditionExpression: "followerAlias = :alias",
      ExpressionAttributeValues: {
        ":alias": alias,
      },
    })
  );

  return (result.Items || []).map((item) => item.followeeAlias);
}

async function getStatusesForUser(alias) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: STATUSES_TABLE_NAME,
      KeyConditionExpression: "userAlias = :alias",
      ExpressionAttributeValues: {
        ":alias": alias,
      },
    })
  );

  return result.Items || [];
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function batchWriteFeedItems(feedItems) {
  for (const batch of chunk(feedItems, 25)) {
    await ddb.send(
      new BatchWriteCommand({
        RequestItems: {
          [FEEDS_TABLE_NAME]: batch.map((item) => ({ PutRequest: { Item: item } })),
        },
      })
    );
  }
}

async function run() {
  console.log(`Backfilling feed for ${TARGET_ALIAS} in ${REGION}...`);
  await ensureTableNames();
  await ensureTargetUserExists();

  const followees = await getFollowees(TARGET_ALIAS);
  const allStatuses = [];

  for (const followeeAlias of followees) {
    const statuses = await getStatusesForUser(followeeAlias);
    allStatuses.push(
      ...statuses.map((status) => ({
        ...status,
        userAlias: TARGET_ALIAS,
      }))
    );
  }

  await batchWriteFeedItems(allStatuses);

  console.log("Backfill complete.");
  console.log(`Target alias: ${TARGET_ALIAS}`);
  console.log(`Followees scanned: ${followees.length}`);
  console.log(`Feed rows written/upserted: ${allStatuses.length}`);
}

run().catch((error) => {
  console.error("Feed backfill failed:", error);
  process.exitCode = 1;
});
