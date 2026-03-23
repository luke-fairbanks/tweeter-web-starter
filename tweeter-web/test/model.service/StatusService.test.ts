/**
 * @jest-environment node
 */
import "isomorphic-fetch";
import { StatusService } from "../../src/model.service/StatusService";
import { AuthToken } from "tweeter-shared";

describe("StatusService Integration Tests", () => {
  const statusService = new StatusService();

  it("should successfully return a user's story pages", async () => {
    const token = new AuthToken("dummy_token", Date.now());
    const alias = "@allen";
    const pageSize = 10;
    const lastItem = null;

    const [storyItems, hasMore] = await statusService.loadMoreStoryItems(token, alias, pageSize, lastItem);
    
    expect(storyItems).toBeDefined();
    expect(storyItems.length).toBeGreaterThan(0);
    expect(hasMore).toBeDefined();
  });
});
