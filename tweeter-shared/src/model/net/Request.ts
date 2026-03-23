export interface TweeterRequest {
  readonly token: string;
}

export interface PagedItemRequest extends TweeterRequest {
  readonly userAlias: string;
  readonly pageSize: number;
  readonly lastItem: any | null;
}

export interface LoginRequest {
  readonly alias: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly alias: string;
  readonly password: string;
  readonly userImageBytes: string;
  readonly imageFileExtension: string;
}

export interface FollowRequest extends TweeterRequest {
  readonly userToFollow: any;
}

export interface UnfollowRequest extends TweeterRequest {
  readonly userToUnfollow: any;
}

export interface GetUserRequest extends TweeterRequest {
  readonly alias: string;
}

export interface GetIsFollowerRequest extends TweeterRequest {
  readonly user: any;
  readonly selectedUser: any;
}

export interface GetCountRequest extends TweeterRequest {
  readonly user: any;
}

export interface PostStatusRequest extends TweeterRequest {
  readonly status: any;
}
