import { AuthToken } from "tweeter-shared";
import { AppNavbarView, AppNavbarPresenter } from "../../src/presenter/AppNavbarPresenter";
import { anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { UserService } from "../../src/model.service/UserService";

describe("AppNavbarPresenter", () => {

    let mockAppNavbarPresenterView: AppNavbarView;
    let appNavbarPresenter: AppNavbarPresenter;

    let mockService: UserService;

    const authToken = new AuthToken("fakeToken", Date.now());
    const loggingOutToastId = "toast-id";

    beforeEach(() => {
        mockAppNavbarPresenterView = mock<AppNavbarView>();
        const mockAppNavbarPresenterViewInstance = instance(mockAppNavbarPresenterView);

        const appNavbarPresenterSpy = spy(new AppNavbarPresenter(mockAppNavbarPresenterViewInstance));
        appNavbarPresenter = instance(appNavbarPresenterSpy);

        mockService = mock<UserService>();

        when(appNavbarPresenterSpy.userService).thenReturn(instance(mockService));
        when(mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)).thenReturn(loggingOutToastId);
    })

    it("tells the view to display a logging out message", async () => {
        await appNavbarPresenter.doLogout(authToken);
        verify(mockAppNavbarPresenterView.displayInfoMessage("Logging Out...", 0)).once();
    });

    it("calls logout on the user service with the correct auth token", async () => {
        await appNavbarPresenter.doLogout(authToken);
        // verify(mockService.logout(authToken)).once();

        let [capturedAuthToken] = capture(mockService.logout).last();
        expect(capturedAuthToken).toBe(authToken);
    })

    it("tells the view to clear the info message that was displayed previously, clear the user info, and navigate to the login page when successful", async () => {
        await appNavbarPresenter.doLogout(authToken);
        verify(mockAppNavbarPresenterView.deleteMessage(loggingOutToastId)).once();
        verify(mockAppNavbarPresenterView.clearUserInfo()).once();
        verify(mockAppNavbarPresenterView.navigate("/login")).once();

        verify(mockAppNavbarPresenterView.displayErrorMessage(anything())).never();

    })

    it("tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page when unsuccessful", async () => {
        let error = new Error("error occurred");
        when(mockService.logout(anything())).thenThrow(error);

        await appNavbarPresenter.doLogout(authToken);

        verify(mockAppNavbarPresenterView.displayErrorMessage("Failed to log user out because of exception: error occurred")).once();

        verify(mockAppNavbarPresenterView.deleteMessage(loggingOutToastId)).never();

        verify(mockAppNavbarPresenterView.clearUserInfo()).never();
        verify(mockAppNavbarPresenterView.navigate("/login")).never();

    })
});
