import { PostStatusRequest, TweeterResponse, AuthToken, Status } from "tweeter-shared";
import { StatusService } from "../../service/StatusService";

export const handler = async (event: any) => {
  let response: TweeterResponse;
  try {
    const request: PostStatusRequest = JSON.parse(event.body);
    const statusService = new StatusService();
    const token = new AuthToken(request.token, Date.now());
    
    const newStatus = Status.fromJson(JSON.stringify(request.status))!;

    await statusService.postStatus(token, newStatus);
    
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
