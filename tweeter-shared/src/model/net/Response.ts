export interface TweeterResponse {
  readonly success: boolean;
  readonly message: string | null;
}

export interface PagedItemResponse extends TweeterResponse {
  readonly items: any[] | null;
  readonly hasMore: boolean;
}

export interface AuthResponse extends TweeterResponse {
  readonly user: any;
  readonly token: any;
}

export interface GetUserResponse extends TweeterResponse {
  readonly user: any | null;
}

export interface GetIsFollowerResponse extends TweeterResponse {
  readonly isFollower: boolean;
}

export interface GetCountResponse extends TweeterResponse {
  readonly count: number;
}

export interface FollowResponse extends TweeterResponse {
  readonly followerCount: number;
  readonly followeeCount: number;
}
