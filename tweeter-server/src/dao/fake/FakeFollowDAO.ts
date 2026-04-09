import { FakeData, User } from "tweeter-shared";
import { FollowDAO } from "../interfaces/FollowDAO";

export class FakeFollowDAO implements FollowDAO {
  public async loadMoreFollowees(
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return FakeData.instance.getPageOfUsers(lastItem, pageSize, userAlias);
  }

  public async loadMoreFollowers(
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return FakeData.instance.getPageOfUsers(lastItem, pageSize, userAlias);
  }

  public async getIsFollowerStatus(
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    return FakeData.instance.isFollower();
  }

  public async getFolloweeCount(user: User): Promise<number> {
    return FakeData.instance.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(user: User): Promise<number> {
    return FakeData.instance.getFollowerCount(user.alias);
  }

  public async follow(
    followerAlias: string,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const followerCount = await this.getFollowerCount(userToFollow);
    const followeeCount = await this.getFolloweeCount(userToFollow);

    return [followerCount, followeeCount];
  }

  public async unfollow(
    followerAlias: string,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const followerCount = await this.getFollowerCount(userToUnfollow);
    const followeeCount = await this.getFolloweeCount(userToUnfollow);

    return [followerCount, followeeCount];
  }
}
