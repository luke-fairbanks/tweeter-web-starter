import { LoginRequest, AuthResponse } from "tweeter-shared";
import { ServiceFactory } from "../../factory/ServiceFactory";

export const handler = async (event: any) => {
  let response: AuthResponse;
  try {
    const request: LoginRequest = JSON.parse(event.body);
    const userService = ServiceFactory.createUserService();
    const [user, authToken] = await userService.login(request.alias, request.password);
    
    response = {
      success: true,
      message: null,
      user: user,
      token: authToken
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
      user: null,
      token: null
    };
    return {
      statusCode: err.message?.includes("[Unauthorized]") ? 401 : err.message?.includes("[BadRequest]") ? 400 : 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
