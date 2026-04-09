import { User } from "tweeter-shared";

export interface FollowDAO {
  loadMoreFollowees(
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]>;

  loadMoreFollowers(
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]>;

  getIsFollowerStatus(
    user: User,
    selectedUser: User
  ): Promise<boolean>;

  getFolloweeCount(user: User): Promise<number>;
  getFollowerCount(user: User): Promise<number>;

  follow(
    followerAlias: string,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]>;

  unfollow(
    followerAlias: string,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]>;
}
