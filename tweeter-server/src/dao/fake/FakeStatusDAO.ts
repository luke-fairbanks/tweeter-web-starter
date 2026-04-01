import { AuthToken, FakeData, Status } from "tweeter-shared";
import { StatusDAO } from "../interfaces/StatusDAO";

export class FakeStatusDAO implements StatusDAO {
  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
  }

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
  }

  public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
    return;
  }
}
