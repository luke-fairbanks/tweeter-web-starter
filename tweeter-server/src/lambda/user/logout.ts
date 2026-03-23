import { TweeterRequest, TweeterResponse, AuthToken } from "tweeter-shared";
import { UserService } from "../../service/UserService";

export const handler = async (event: any) => {
  let response: TweeterResponse;
  try {
    const request: TweeterRequest = JSON.parse(event.body);
    const userService = new UserService();
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
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
