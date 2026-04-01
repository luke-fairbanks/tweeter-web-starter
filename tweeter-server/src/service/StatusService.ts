import { AuthToken, Status } from "tweeter-shared";
import { StatusDAO } from "../dao/interfaces/StatusDAO";

export class StatusService {
  public constructor(private statusDAO: StatusDAO) {}

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return this.statusDAO.loadMoreStoryItems(authToken, userAlias, pageSize, lastItem);
  }

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return this.statusDAO.loadMoreFeedItems(authToken, userAlias, pageSize, lastItem);
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    return this.statusDAO.postStatus(authToken, newStatus);
  }
}
