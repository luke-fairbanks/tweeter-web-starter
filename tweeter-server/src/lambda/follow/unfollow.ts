import { UnfollowRequest, FollowResponse, AuthToken, User } from "tweeter-shared";
import { ServiceFactory } from "../../factory/ServiceFactory";

export const handler = async (event: any) => {
  let response: FollowResponse;
  try {
    const request: UnfollowRequest = JSON.parse(event.body);
    const authorizationService = ServiceFactory.createAuthorizationService();
    await authorizationService.verifySession(request.token);
    const followService = ServiceFactory.createFollowService();
    const token = new AuthToken(request.token, Date.now());
    
    const userToUnfollow = User.fromJson(JSON.stringify(request.userToUnfollow))!;

    const [followerCount, followeeCount] = await followService.unfollow(token, userToUnfollow);
    
    response = {
      success: true,
      message: null,
      followerCount: followerCount,
      followeeCount: followeeCount
    };
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  } catch (err: any) {
    response = {
      success: false,
      message: err.message,
      followerCount: 0,
      followeeCount: 0
    };
    return {
      statusCode: err.message?.includes("[Unauthorized]") ? 401 : err.message?.includes("[BadRequest]") ? 400 : 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
