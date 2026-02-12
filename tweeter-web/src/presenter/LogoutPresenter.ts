import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface LogoutView {
    displayInfoMessage: (message: string, duration: number) => string;
    deleteMessage: (messageId: string) => void;
    displayErrorMessage: (message: string) => void;
    clearUserInfo: () => void;
    navigate: (url: string) => void;
}

export class LogoutPresenter {
    private view: LogoutView;
    private userService: UserService;

    public constructor(view: LogoutView) {
        this.view = view;
        this.userService = new UserService();
    }

    public async doLogout(authToken: AuthToken): Promise<void> {
        let loggingOutToastId = "";

        try {
            loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);
            await this.userService.logout(authToken);
            this.view.clearUserInfo();
            this.view.navigate("/login");
        } catch (error) {
            this.view.displayErrorMessage(
                `Failed to log user out because of exception: ${error}`
            );
        } finally {
            if (loggingOutToastId) {
                this.view.deleteMessage(loggingOutToastId);
            }
        }
    }

}
