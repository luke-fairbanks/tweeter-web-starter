import { AuthToken } from "tweeter-shared";
import { anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import {PostStatusPresenter, PostStatusView} from "../../src/presenter/PostStatusPresenter";
import { StatusService } from "../../src/model.service/StatusService";
import { User } from "tweeter-shared";

describe("PostStatusPresenter", () => {

    let mockPostStatusPresenterView: PostStatusView;
    let postStatusPresenter: PostStatusPresenter;

    let mockService: StatusService;

    let mockCurrentUser: User;
    let mockCurrentUserInstance: User;

    const authToken = new AuthToken("fakeToken", Date.now());
    const postText = "This is a post";

    beforeEach(() => {
        mockPostStatusPresenterView = mock<PostStatusView>();
        const mockPostStatusPresenterViewInstance = instance(mockPostStatusPresenterView);

        const postStatusPresenterSpy = spy(new PostStatusPresenter(mockPostStatusPresenterViewInstance));
        postStatusPresenter = instance(postStatusPresenterSpy);

        mockService = mock<StatusService>();

        when(postStatusPresenterSpy.statusService).thenReturn(instance(mockService));

        mockCurrentUser = mock<User>();
        when(mockCurrentUser.alias).thenReturn("@testUser");
        mockCurrentUserInstance = instance(mockCurrentUser);

    })

    it("tells the view to display a posting status message", async () => {
        await postStatusPresenter.submitPost(postText, authToken, mockCurrentUserInstance);
        verify(mockPostStatusPresenterView.displayInfoMessage("Posting status...", 0)).once();
    });

    it("calls postStatus on the post status service with the correct status string and auth token", async () => {
        await postStatusPresenter.submitPost(postText, authToken, mockCurrentUserInstance);

        let [capturedAuthToken, capturedStatus] = capture(mockService.postStatus).last();
        expect(capturedAuthToken).toBe(authToken);
        expect(capturedStatus.post).toBe(postText);
        expect(capturedStatus.user.alias).toBe("@testUser");
    })

    it("tells the view to clear the info message that was displayed previously, clear the post, and display a status posted message when successful", async () => {
        const postingStatusToastId = "toast-id";
        when(mockPostStatusPresenterView.displayInfoMessage("Posting status...", 0)).thenReturn(postingStatusToastId);

        await postStatusPresenter.submitPost(postText, authToken, mockCurrentUserInstance);
        verify(mockPostStatusPresenterView.deleteMessage(postingStatusToastId)).once();
        verify(mockPostStatusPresenterView.setPost("")).once();
        verify(mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)).once();

        verify(mockPostStatusPresenterView.displayErrorMessage(anything())).never();

    })

    it("tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message when unsuccessful", async () => {
        const postingStatusToastId = "toast-id";
        when(mockPostStatusPresenterView.displayInfoMessage("Posting status...", 0)).thenReturn(postingStatusToastId);

        let error = new Error("error occurred");
        when(mockService.postStatus(anything(), anything())).thenThrow(error);

        await postStatusPresenter.submitPost(postText, authToken, mockCurrentUserInstance);

        verify(mockPostStatusPresenterView.deleteMessage(postingStatusToastId)).once();
        verify(mockPostStatusPresenterView.displayErrorMessage("Failed to post status because of exception: error occurred")).once();

        verify(mockPostStatusPresenterView.setPost(anything())).never();
        verify(mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)).never();
    })
});