import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class StatusService implements Service {
  private facade = new ServerFacade();

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return await this.facade.loadMoreStoryItems({ token: authToken.token, userAlias, pageSize, lastItem });
  }

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return await this.facade.loadMoreFeedItems({ token: authToken.token, userAlias, pageSize, lastItem });
  }

  public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
    return await this.facade.postStatus({ token: authToken.token, status: newStatus });
  }
}