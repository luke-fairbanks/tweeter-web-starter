import { AuthToken, User } from "tweeter-shared";
import { FollowDAO } from "../dao/interfaces/FollowDAO";
import { SessionDAO } from "../dao/interfaces/SessionDAO";

export class FollowService {
  public constructor(private followDAO: FollowDAO, private sessionDAO: SessionDAO) {}

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return this.followDAO.loadMoreFollowees(userAlias, pageSize, lastItem);
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return this.followDAO.loadMoreFollowers(userAlias, pageSize, lastItem);
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    return this.followDAO.getIsFollowerStatus(user, selectedUser);
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.followDAO.getFolloweeCount(user);
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.followDAO.getFollowerCount(user);
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const currentAlias = await this.sessionDAO.resolveAlias(authToken.token);
    if (!currentAlias) {
      throw new Error("[Unauthorized] Invalid or expired auth token");
    }

    if (currentAlias === userToFollow.alias) {
      throw new Error("[BadRequest] You cannot follow yourself");
    }

    return this.followDAO.follow(currentAlias, userToFollow);
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const currentAlias = await this.sessionDAO.resolveAlias(authToken.token);
    if (!currentAlias) {
      throw new Error("[Unauthorized] Invalid or expired auth token");
    }

    return this.followDAO.unfollow(currentAlias, userToUnfollow);
  }
}
