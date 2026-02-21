import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView {
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
  private followService: FollowService;

  private followerCount: number = 0;
  private followeeCount: number = 0;

  public constructor(view: UserInfoView) {
    super(view);
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

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(
      async () => {
        if (currentUser.alias === displayedUser.alias) {
          this.view.setIsFollower(false);
        } else {
          this.view.setIsFollower(
            await this.followService.getIsFollowerStatus(
              authToken,
              currentUser,
              displayedUser
            )
          );
        }
      },
      "determine follower status"
    );
  }

  public async setNumbFollowees(
    authToken: AuthToken,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(
      async () => {
        this.followeeCount = await this.followService.getFolloweeCount(
          authToken,
          displayedUser
        );
        this.view.setFolloweeCount(this.followeeCount);
      },
      "get followees count"
    );
  }

  public async setNumbFollowers(
    authToken: AuthToken,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(
      async () => {
        this.followerCount = await this.followService.getFollowerCount(
          authToken,
          displayedUser
        );
        this.view.setFollowerCount(this.followerCount);
      },
      "get followers count"
    );
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<void> {
    await this.doFollowOperation(
      authToken,
      userToFollow,
      (token, user) => this.followService.follow(token, user),
      `Following ${userToFollow.name}...`,
      "follow user",
      true
    );
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<void> {
    await this.doFollowOperation(
      authToken,
      userToUnfollow,
      (token, user) => this.followService.unfollow(token, user),
      `Unfollowing ${userToUnfollow.name}...`,
      "unfollow user",
      false
    );
  }

  private async doFollowOperation(
    authToken: AuthToken,
    targetUser: User,
    followOperation: (
      authToken: AuthToken,
      user: User
    ) => Promise<[followerCount: number, followeeCount: number]>,
    infoMessage: string,
    operationDescription: string,
    isFollower: boolean
  ): Promise<void> {
    let followToastId = "";

    await this.doFailureReportingOperation(
      async () => {
        this.view.setIsLoading(true);
        followToastId = this.view.displayInfoMessage(infoMessage, 0);

        const [followerCount, followeeCount] = await followOperation(
          authToken,
          targetUser
        );

        this.followerCount = followerCount;
        this.followeeCount = followeeCount;

        this.view.setIsFollower(isFollower);
        this.view.setFollowerCount(this.followerCount);
        this.view.setFolloweeCount(this.followeeCount);
      },
      operationDescription,
      () => {
        if (followToastId) {
          this.view.deleteMessage(followToastId);
        }
        this.view.setIsLoading(false);
      }
    );
  }
}
