/**
 * @jest-environment node
 */
import "isomorphic-fetch";
import { ServerFacade } from "../../src/network/ServerFacade";
import { RegisterRequest, PagedItemRequest, GetCountRequest, User } from "tweeter-shared";

describe("ServerFacade Integration Tests", () => {
  const facade = new ServerFacade();

  it("should successfully register a user", async () => {
    const request: RegisterRequest = {
      firstName: "Test",
      lastName: "User",
      alias: "@testuser123",
      password: "password123",
      userImageBytes: "base64encodedimage",
      imageFileExtension: "png"
    };

    const [user, token] = await facade.register(request);
    expect(user).toBeDefined();
    expect(user.alias).toBe("@allen");
    expect(token).toBeDefined();
    expect(token.token).toBeDefined();
  });

  it("should successfully get followers", async () => {
    // Generate a token or use a dummy request
    const request: PagedItemRequest = {
      token: "dummy_token",
      userAlias: "@allen",
      pageSize: 10,
      lastItem: null
    };

    const [followers, hasMore] = await facade.loadMoreFollowers(request);
    expect(followers).toBeDefined();
    expect(followers.length).toBeGreaterThan(0);
    expect(hasMore).toBeDefined();
  });

  it("should successfully get follower count", async () => {
    const user = new User("Allen", "Anderson", "@allen", "https://faculty.cs.byu.edu/~jwilkerson/cs340/tweeter/images/donald_duck.png");
    const request: GetCountRequest = {
      token: "dummy_token",
      user: user
    };

    const count = await facade.getFollowerCount(request);
    expect(count).toBeGreaterThan(0);
  });
});
