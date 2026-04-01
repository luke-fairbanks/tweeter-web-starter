import { AuthToken, User } from "tweeter-shared";
import { FollowDAO } from "../dao/interfaces/FollowDAO";

export class FollowService {
  public constructor(private followDAO: FollowDAO) {}

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return this.followDAO.loadMoreFollowees(authToken, userAlias, pageSize, lastItem);
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return this.followDAO.loadMoreFollowers(authToken, userAlias, pageSize, lastItem);
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    return this.followDAO.getIsFollowerStatus(authToken, user, selectedUser);
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.followDAO.getFolloweeCount(authToken, user);
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.followDAO.getFollowerCount(authToken, user);
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.followDAO.follow(authToken, userToFollow);
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.followDAO.unfollow(authToken, userToUnfollow);
  }
}
