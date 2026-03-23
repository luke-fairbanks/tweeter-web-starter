import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class FollowService implements Service {
  private facade = new ServerFacade();

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return await this.facade.loadMoreFollowees({ token: authToken.token, userAlias, pageSize, lastItem });
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return await this.facade.loadMoreFollowers({ token: authToken.token, userAlias, pageSize, lastItem });
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    return await this.facade.getIsFollowerStatus({ token: authToken.token, user, selectedUser });
  }

  public async getFolloweeCount(authToken: AuthToken, user: User): Promise<number> {
    return await this.facade.getFolloweeCount({ token: authToken.token, user });
  }

  public async getFollowerCount(authToken: AuthToken, user: User): Promise<number> {
    return await this.facade.getFollowerCount({ token: authToken.token, user });
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.facade.follow({ token: authToken.token, userToFollow });
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.facade.unfollow({ token: authToken.token, userToUnfollow });
  }
}
