import { GetCountRequest, GetCountResponse, AuthToken, User } from "tweeter-shared";
import { ServiceFactory } from "../../factory/ServiceFactory";

export const handler = async (event: any) => {
  let response: GetCountResponse;
  try {
    const request: GetCountRequest = JSON.parse(event.body);
    const authorizationService = ServiceFactory.createAuthorizationService();
    await authorizationService.verifySession(request.token);
    const followService = ServiceFactory.createFollowService();
    const token = new AuthToken(request.token, Date.now());
    
    const user = User.fromJson(JSON.stringify(request.user))!;

    const count = await followService.getFollowerCount(token, user);
    
    response = {
      success: true,
      message: null,
      count: count
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
      count: 0
    };
    return {
      statusCode: err.message?.includes("[Unauthorized]") ? 401 : err.message?.includes("[BadRequest]") ? 400 : 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
