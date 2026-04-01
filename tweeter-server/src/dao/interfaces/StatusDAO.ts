import { AuthToken, Status } from "tweeter-shared";

export interface StatusDAO {
  loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]>;

  loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]>;

  postStatus(authToken: AuthToken, newStatus: Status): Promise<void>;
}
