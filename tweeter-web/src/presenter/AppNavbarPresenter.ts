import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { MessageView, Presenter } from "./Presenter";

export interface AppNavbarView extends MessageView{
    clearUserInfo: () => void;
    navigate: (url: string) => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
    private _userService: UserService;

    public constructor(view: AppNavbarView) {
        super(view)
        this._userService = new UserService();
    }

    public get userService(): UserService {
        return this._userService;
    }

    public async doLogout(authToken: AuthToken): Promise<void> {
        let loggingOutToastId = "";

        await this.doFailureReportingOperation(
            async () => {
                loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);
                await this.userService.logout(authToken);
                this.view.clearUserInfo();
                this.view.navigate("/login");
                this.view.deleteMessage(loggingOutToastId);

            },
            "log user out",
            () => {}
        );
    }

}
