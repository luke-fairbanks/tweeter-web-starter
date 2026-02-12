import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";

export interface UserInfoView {
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  displayInfoMessage: (message: string, duration: number) => string;
  displayErrorMessage: (message: string) => void;
  deleteMessage: (messageId: string) => void;
}

export class UserInfoPresenter {
  private view: UserInfoView;
  private followService: FollowService;

  private followerCount: number = 0;
  private followeeCount: number = 0;

  public constructor(view: UserInfoView) {
    this.view = view;
    this.followService = new FollowService();
  }

  public async loadUserInfo(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    await Promise.all([
      this.setIsFollowerStatus(authToken, currentUser, displayedUser),
      this.setNumbFollowees(authToken, displayedUser),
      this.setNumbFollowers(authToken, displayedUser),
    ]);
  }

  public async setIsFollowerStatus  (
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    try {
      if (currentUser.alias === displayedUser.alias) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.followService.getIsFollowerStatus(authToken, currentUser, displayedUser)
        );
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to determine follower status because of exception: ${error}`
      );
    }
  };

  public async setNumbFollowees (
    authToken: AuthToken,
    displayedUser: User
  ) {
    try {
      this.followeeCount = await this.followService.getFolloweeCount(authToken, displayedUser);
      this.view.setFolloweeCount(this.followeeCount);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followees count because of exception: ${error}`
      );
    }
  };

  public async setNumbFollowers (
    authToken: AuthToken,
    displayedUser: User
  ) {
    try {
      this.followerCount = await this.followService.getFollowerCount(authToken, displayedUser);
      this.view.setFollowerCount(this.followerCount);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followers count because of exception: ${error}`
      );
    }
  };

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ) {
    let followingUserToast = "";
    try {
        this.view.setIsLoading(true);
        followingUserToast = this.view.displayInfoMessage(`Following ${userToFollow.name}...`, 0);

        const [followerCount, followeeCount] = await this.followService.follow(
            authToken,
            userToFollow
        );

        this.followerCount = followerCount;
        this.followeeCount = followeeCount;

        this.view.setIsFollower(true);
        this.view.setFollowerCount(this.followerCount);
        this.view.setFolloweeCount(this.followeeCount);
    } catch (error) {
        this.view.displayErrorMessage(
            `Failed to follow user because of exception: ${error}`
        );
    } finally {
        this.view.deleteMessage(followingUserToast);
        this.view.setIsLoading(false);
    }
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ) {
    let unfollowingUserToast = "";
    try {
        this.view.setIsLoading(true);
        unfollowingUserToast = this.view.displayInfoMessage(`Unfollowing ${userToUnfollow.name}...`, 0);

        const [followerCount, followeeCount] = await this.followService.unfollow(
            authToken,
            userToUnfollow
        );

        this.followerCount = followerCount;
        this.followeeCount = followeeCount;

        this.view.setIsFollower(false);
        this.view.setFollowerCount(this.followerCount);
        this.view.setFolloweeCount(this.followeeCount);
    } catch (error) {
        this.view.displayErrorMessage(
            `Failed to unfollow user because of exception: ${error}`
        );
    } finally {
        this.view.deleteMessage(unfollowingUserToast);
        this.view.setIsLoading(false);
    }
  }
}
