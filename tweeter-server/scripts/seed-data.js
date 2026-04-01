const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  CloudFormationClient,
  DescribeStackResourceCommand,
} = require("@aws-sdk/client-cloudformation");
const {
  DynamoDBDocumentClient,
  PutCommand,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");

const REGION = process.env.AWS_REGION || "us-west-2";
const STACK_NAME = process.env.STACK_NAME || "tweeter-server";
let USERS_TABLE_NAME = process.env.USERS_TABLE_NAME;
let FOLLOWS_TABLE_NAME = process.env.FOLLOWS_TABLE_NAME;
let STATUSES_TABLE_NAME = process.env.STATUSES_TABLE_NAME;
let FEEDS_TABLE_NAME = process.env.FEEDS_TABLE_NAME;

const PRIMARY_USER = {
  alias: "@seedowner",
  firstName: "Seed",
  lastName: "Owner",
  imageUrl: "https://i.pravatar.cc/256?img=1",
};

const FOLLOWER_COUNT = 14;
const PRIMARY_FOLLOWEE_COUNT = 12;
const PRIMARY_STATUS_COUNT = 15;
const PASSWORD = "password123";
const SEED_TIMESTAMP_BASE = 1774400000000;

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

  if (!USERS_TABLE_NAME || !FOLLOWS_TABLE_NAME || !STATUSES_TABLE_NAME || !FEEDS_TABLE_NAME) {
    throw new Error(
      "Unable to resolve all required table names. Ensure stack is deployed or provide env vars."
    );
  }
}

function buildFollowers(count) {
  const followers = [];
  for (let i = 1; i <= count; i++) {
    followers.push({
      alias: `@seed${String(i).padStart(2, "0")}`,
      firstName: `Seed${i}`,
      lastName: "User",
      imageUrl: `https://i.pravatar.cc/256?img=${(i % 70) + 2}`,
    });
  }
  return followers;
}

async function putUser(user, passwordHash) {
  await ddb.send(
    new PutCommand({
      TableName: USERS_TABLE_NAME,
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

async function putFollow(followerAlias, followeeAlias) {
  await ddb.send(
    new PutCommand({
      TableName: FOLLOWS_TABLE_NAME,
      Item: {
        followerAlias,
        followeeAlias,
      },
    })
  );
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function batchWriteFeedItems(feedItems) {
  const batches = chunk(feedItems, 25);
  for (const batch of batches) {
    await ddb.send(
      new BatchWriteCommand({
        RequestItems: {
          [FEEDS_TABLE_NAME]: batch.map((item) => ({ PutRequest: { Item: item } })),
        },
      })
    );
  }
}

async function seed() {
  console.log(`Seeding Tweeter data in region ${REGION}...`);
  await ensureTableNames();
  console.log(`Using stack: ${STACK_NAME}`);
  console.log(`Users table: ${USERS_TABLE_NAME}`);
  console.log(`Follows table: ${FOLLOWS_TABLE_NAME}`);
  console.log(`Statuses table: ${STATUSES_TABLE_NAME}`);
  console.log(`Feeds table: ${FEEDS_TABLE_NAME}`);

  const followers = buildFollowers(FOLLOWER_COUNT);
  const allUsers = [PRIMARY_USER, ...followers];
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  for (const user of allUsers) {
    await putUser(user, passwordHash);
  }

  for (const follower of followers) {
    await putFollow(follower.alias, PRIMARY_USER.alias);
  }

  for (const followee of followers.slice(0, PRIMARY_FOLLOWEE_COUNT)) {
    await putFollow(PRIMARY_USER.alias, followee.alias);
  }

  for (let i = 0; i < PRIMARY_STATUS_COUNT; i++) {
    const timestamp = SEED_TIMESTAMP_BASE + i;
    const post = `Seed status #${i + 1} from ${PRIMARY_USER.alias}`;

    const storyItem = {
      userAlias: PRIMARY_USER.alias,
      timestamp,
      post,
      authorAlias: PRIMARY_USER.alias,
      authorFirstName: PRIMARY_USER.firstName,
      authorLastName: PRIMARY_USER.lastName,
      authorImageUrl: PRIMARY_USER.imageUrl,
    };

    await ddb.send(
      new PutCommand({
        TableName: STATUSES_TABLE_NAME,
        Item: storyItem,
      })
    );

    const feedItems = followers.map((follower) => ({
      ...storyItem,
      userAlias: follower.alias,
    }));

    await batchWriteFeedItems(feedItems);
  }

  console.log("Seed complete.");
  console.log(`Users upserted: ${allUsers.length}`);
  console.log(`Followers for ${PRIMARY_USER.alias}: ${FOLLOWER_COUNT}`);
  console.log(`Followees for ${PRIMARY_USER.alias}: ${PRIMARY_FOLLOWEE_COUNT}`);
  console.log(`Story items for ${PRIMARY_USER.alias}: ${PRIMARY_STATUS_COUNT}`);
  console.log(`Password for all seed users: ${PASSWORD}`);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
