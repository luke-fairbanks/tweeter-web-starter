import { TweeterRequest, TweeterResponse, AuthToken } from "tweeter-shared";
import { ServiceFactory } from "../../factory/ServiceFactory";

export const handler = async (event: any) => {
  let response: TweeterResponse;
  try {
    const request: TweeterRequest = JSON.parse(event.body);
    const authorizationService = ServiceFactory.createAuthorizationService();
    await authorizationService.verifySession(request.token);
    const userService = ServiceFactory.createUserService();
    const token = new AuthToken(request.token, Date.now()); 
    await userService.logout(token);
    
    response = {
      success: true,
      message: null
    };
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  } catch (err: any) {
    response = {
      success: false,
      message: err.message
    };
    return {
      statusCode: err.message?.includes("[Unauthorized]") ? 401 : err.message?.includes("[BadRequest]") ? 400 : 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
