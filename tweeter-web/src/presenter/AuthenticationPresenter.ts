import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";

export interface AuthenticationView extends View {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  setIsLoading: (isLoading: boolean) => void;
  navigate: (url: string) => void;
}

export abstract class AuthenticationPresenter<
  V extends AuthenticationView
> extends Presenter<V> {
  protected async doAuthenticationOperation(
    authenticateOperation: () => Promise<[User, AuthToken]>,
    rememberMe: boolean,
    operationDescription: string,
    getNavigateUrl: (user: User) => string
  ): Promise<void> {
    this.view.setIsLoading(true);

    await this.doFailureReportingOperation(
      async () => {
        const [user, authToken] = await authenticateOperation();
        this.view.updateUserInfo(user, user, authToken, rememberMe);
        this.view.navigate(getNavigateUrl(user));
      },
      operationDescription,
      () => this.view.setIsLoading(false)
    );
  }
}
