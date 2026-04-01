const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  CloudFormationClient,
  DescribeStackResourceCommand,
} = require("@aws-sdk/client-cloudformation");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-west-2";
const STACK_NAME = process.env.STACK_NAME || "tweeter-server";
const RAW_TARGET_ALIAS = process.env.TARGET_ALIAS || "@luke";
const TARGET_ALIAS = RAW_TARGET_ALIAS.startsWith("@")
  ? RAW_TARGET_ALIAS
  : `@${RAW_TARGET_ALIAS}`;

let USERS_TABLE_NAME = process.env.USERS_TABLE_NAME;
let FOLLOWS_TABLE_NAME = process.env.FOLLOWS_TABLE_NAME;

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

  if (!USERS_TABLE_NAME || !FOLLOWS_TABLE_NAME) {
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
    throw new Error(
      `Target user ${TARGET_ALIAS} was not found in ${USERS_TABLE_NAME}. Register first, then rerun.`
    );
  }
}

async function getAllUserAliases() {
  const aliases = [];
  let exclusiveStartKey;

  do {
    const result = await ddb.send(
      new ScanCommand({
        TableName: USERS_TABLE_NAME,
        ProjectionExpression: "alias",
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    const pageAliases = (result.Items || [])
      .map((item) => item.alias)
      .filter((alias) => typeof alias === "string");

    aliases.push(...pageAliases);
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return aliases;
}

async function putFollow(followerAlias, followeeAlias) {
  await ddb.send(
    new PutCommand({
      TableName: FOLLOWS_TABLE_NAME,
      Item: { followerAlias, followeeAlias },
    })
  );
}

async function linkBidirectionalFollows() {
  console.log(`Linking follows for ${TARGET_ALIAS} in region ${REGION}...`);
  await ensureTableNames();
  await ensureTargetUserExists();

  const aliases = await getAllUserAliases();
  const otherAliases = aliases.filter((alias) => alias !== TARGET_ALIAS);

  for (const alias of otherAliases) {
    await putFollow(TARGET_ALIAS, alias);
    await putFollow(alias, TARGET_ALIAS);
  }

  console.log("Follow linking complete.");
  console.log(`Target alias: ${TARGET_ALIAS}`);
  console.log(`Users linked: ${otherAliases.length}`);
  console.log(
    `Relationships created/upserted: ${otherAliases.length * 2} (target->others and others->target)`
  );
}

linkBidirectionalFollows().catch((error) => {
  console.error("Follow linking failed:", error);
  process.exitCode = 1;
});
