import { GetUserRequest, GetUserResponse, AuthToken } from "tweeter-shared";
import { UserService } from "../../service/UserService";

export const handler = async (event: any) => {
  let response: GetUserResponse;
  try {
    const request: GetUserRequest = JSON.parse(event.body);
    const userService = new UserService();
    // Reconstruct token if necessary, assuming request.token is the string
    const token = new AuthToken(request.token, Date.now()); 
    const user = await userService.getUser(token, request.alias);
    
    response = {
      success: true,
      message: null,
      user: user
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
      user: null
    };
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
