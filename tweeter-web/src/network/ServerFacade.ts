import {
  AuthToken,
  User,
  Status,
  LoginRequest,
  RegisterRequest,
  GetUserRequest,
  TweeterRequest,
  PagedItemRequest,
  GetCountRequest,
  GetIsFollowerRequest,
  FollowRequest,
  UnfollowRequest,
  PostStatusRequest,
  AuthResponse,
  GetUserResponse,
  TweeterResponse,
  PagedItemResponse,
  GetCountResponse,
  GetIsFollowerResponse,
  FollowResponse
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL = "https://yunyfgvwob.execute-api.us-west-2.amazonaws.com/Prod";
  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<LoginRequest, AuthResponse>(request, "/login");
    if (response.success) {
      return [User.fromJson(JSON.stringify(response.user))!, AuthToken.fromJson(JSON.stringify(response.token))!];
    } else throw new Error(response.message!);
  }

  public async register(request: RegisterRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<RegisterRequest, AuthResponse>(request, "/register");
    if (response.success) {
      return [User.fromJson(JSON.stringify(response.user))!, AuthToken.fromJson(JSON.stringify(response.token))!];
    } else throw new Error(response.message!);
  }

  public async getUser(request: GetUserRequest): Promise<User | null> {
    const response = await this.clientCommunicator.doPost<GetUserRequest, GetUserResponse>(request, "/user/get");
    if (response.success) {
      return response.user ? User.fromJson(JSON.stringify(response.user)) : null;
    } else throw new Error(response.message!);
  }

  public async logout(request: TweeterRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<TweeterRequest, TweeterResponse>(request, "/logout");
    if (!response.success) throw new Error(response.message!);
  }

  public async loadMoreFollowers(request: PagedItemRequest): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<PagedItemRequest, PagedItemResponse>(request, "/follower/list");
    if (response.success) {
      const items = response.items?.map((dto: any) => User.fromJson(JSON.stringify(dto))!) || [];
      return [items, response.hasMore];
    } else throw new Error(response.message!);
  }

  public async loadMoreFollowees(request: PagedItemRequest): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<PagedItemRequest, PagedItemResponse>(request, "/followee/list");
    if (response.success) {
      const items = response.items?.map((dto: any) => User.fromJson(JSON.stringify(dto))!) || [];
      return [items, response.hasMore];
    } else throw new Error(response.message!);
  }

  public async getFollowerCount(request: GetCountRequest): Promise<number> {
    const response = await this.clientCommunicator.doPost<GetCountRequest, GetCountResponse>(request, "/follower/count");
    if (response.success) return response.count;
    else throw new Error(response.message!);
  }

  public async getFolloweeCount(request: GetCountRequest): Promise<number> {
    const response = await this.clientCommunicator.doPost<GetCountRequest, GetCountResponse>(request, "/followee/count");
    if (response.success) return response.count;
    else throw new Error(response.message!);
  }

  public async getIsFollowerStatus(request: GetIsFollowerRequest): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<GetIsFollowerRequest, GetIsFollowerResponse>(request, "/follow/status");
    if (response.success) return response.isFollower;
    else throw new Error(response.message!);
  }

  public async follow(request: FollowRequest): Promise<[number, number]> {
    const response = await this.clientCommunicator.doPost<FollowRequest, FollowResponse>(request, "/follow");
    if (response.success) return [response.followerCount, response.followeeCount];
    else throw new Error(response.message!);
  }

  public async unfollow(request: UnfollowRequest): Promise<[number, number]> {
    const response = await this.clientCommunicator.doPost<UnfollowRequest, FollowResponse>(request, "/unfollow");
    if (response.success) return [response.followerCount, response.followeeCount];
    else throw new Error(response.message!);
  }

  public async loadMoreStoryItems(request: PagedItemRequest): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<PagedItemRequest, PagedItemResponse>(request, "/status/story/list");
    if (response.success) {
      const items = response.items?.map((dto: any) => Status.fromJson(JSON.stringify(dto))!) || [];
      return [items, response.hasMore];
    } else throw new Error(response.message!);
  }

  public async loadMoreFeedItems(request: PagedItemRequest): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<PagedItemRequest, PagedItemResponse>(request, "/status/feed/list");
    if (response.success) {
      const items = response.items?.map((dto: any) => Status.fromJson(JSON.stringify(dto))!) || [];
      return [items, response.hasMore];
    } else throw new Error(response.message!);
  }

  public async postStatus(request: PostStatusRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<PostStatusRequest, TweeterResponse>(request, "/status/post");
    if (!response.success) throw new Error(response.message!);
  }
}
