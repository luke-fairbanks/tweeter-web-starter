import { PagedItemRequest, PagedItemResponse, AuthToken, Status } from "tweeter-shared";
import { ServiceFactory } from "../../factory/ServiceFactory";

export const handler = async (event: any) => {
  let response: PagedItemResponse;
  try {
    const request: PagedItemRequest = JSON.parse(event.body);
    const authorizationService = ServiceFactory.createAuthorizationService();
    await authorizationService.verifySession(request.token);
    const statusService = ServiceFactory.createStatusService();
    const token = new AuthToken(request.token, Date.now());
    
    const lastItem = request.lastItem ? Status.fromJson(JSON.stringify(request.lastItem)) : null;

    const [items, hasMore] = await statusService.loadMoreFeedItems(
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
      statusCode: err.message?.includes("[Unauthorized]") ? 401 : err.message?.includes("[BadRequest]") ? 400 : 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response)
    };
  }
};
