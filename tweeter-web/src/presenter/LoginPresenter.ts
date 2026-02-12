import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface LoginView {
    updateUserInfo: (
        currentUser: User,
        displayedUser: User,
        authToken: AuthToken,
        remember: boolean
    ) => void
    displayErrorMessage: (message: string) => void
    setIsLoading: (isLoading: boolean) => void
    navigate: (url: string) => void
}

export class LoginPresenter {
    private view: LoginView;
    private userService: UserService;

    public constructor(view: LoginView) {
        this.view = view;
        this.userService = new UserService();
    }

    public isLoginDisabled(alias: string, password: string): boolean {
        return !alias || !password;
    }

    public async doLogin (
        alias: string,
        password: string,
        rememberMe: boolean,
        originalUrl?: string
    ): Promise<void> {
    try {
      this.view.setIsLoading(true);
      const [user, authToken] = await this.userService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user in because of exception: ${error}`
      );
    } finally {
      this.view.setIsLoading(false);
    }
  };

}
