import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { MessageView, Presenter } from "./Presenter";

export interface LogoutView extends MessageView{
    clearUserInfo: () => void;
    navigate: (url: string) => void;
}

export class LogoutPresenter extends Presenter<LogoutView> {
    private userService: UserService;

    public constructor(view: LogoutView) {
        super(view)
        this.userService = new UserService();
    }

    public async doLogout(authToken: AuthToken): Promise<void> {
        let loggingOutToastId = "";

        await this.doFailureReportingOperation(
            async () => {
                loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);
                await this.userService.logout(authToken);
                this.view.clearUserInfo();
                this.view.navigate("/login");
            },
            "log user out",
            () => {
                if (loggingOutToastId) {
                    this.view.deleteMessage(loggingOutToastId);
                }
            }
        );
    }

}
