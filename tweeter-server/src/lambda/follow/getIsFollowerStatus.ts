import { GetIsFollowerRequest, GetIsFollowerResponse, AuthToken, User } from "tweeter-shared";
import { FollowService } from "../../service/FollowService";

export const handler = async (event: any) => {
  let response: GetIsFollowerResponse;
  try {
    const request: GetIsFollowerRequest = JSON.parse(event.body);
    const followService = new FollowService();
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
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
