import { RegisterRequest, AuthResponse } from "tweeter-shared";
import { UserService } from "../../service/UserService";

export const handler = async (event: any) => {
  let response: AuthResponse;
  try {
    const request: RegisterRequest = JSON.parse(event.body);
    const userService = new UserService();
    const [user, authToken] = await userService.register(
      request.firstName,
      request.lastName,
      request.alias,
      request.password,
      new Uint8Array(Buffer.from(request.userImageBytes, "base64")),
      request.imageFileExtension
    );
    
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
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
