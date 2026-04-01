import { GetIsFollowerRequest, GetIsFollowerResponse, AuthToken, User } from "tweeter-shared";
import { ServiceFactory } from "../../factory/ServiceFactory";

export const handler = async (event: any) => {
  let response: GetIsFollowerResponse;
  try {
    const request: GetIsFollowerRequest = JSON.parse(event.body);
    const authorizationService = ServiceFactory.createAuthorizationService();
    await authorizationService.verifySession(request.token);
    const followService = ServiceFactory.createFollowService();
    const token = new AuthToken(request.token, Date.now());
    
    const user = User.fromJson(JSON.stringify(request.user))!;
    const selectedUser = User.fromJson(JSON.stringify(request.selectedUser))!;

    const isFollower = await followService.getIsFollowerStatus(token, user, selectedUser);
    
    response = {
      success: true,
      message: null,
      isFollower: isFollower
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
      isFollower: false
    };
    return {
      statusCode: err.message?.includes("[Unauthorized]") ? 401 : err.message?.includes("[BadRequest]") ? 400 : 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
