import { PagedItemRequest, PagedItemResponse, AuthToken, User } from "tweeter-shared";
import { FollowService } from "../../service/FollowService";

export const handler = async (event: any) => {
  let response: PagedItemResponse;
  try {
    const request: PagedItemRequest = JSON.parse(event.body);
    const followService = new FollowService();
    const token = new AuthToken(request.token, Date.now());
    
    const lastItem = request.lastItem ? User.fromJson(JSON.stringify(request.lastItem)) : null;

    const [items, hasMore] = await followService.loadMoreFollowers(
      token,
      request.userAlias,
      request.pageSize,
      lastItem
    );
    
    response = {
      success: true,
      message: null,
      items: items,
      hasMore: hasMore
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
      items: null,
      hasMore: false
    };
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
