import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserNavigationView {
    setDisplayedUser: (user: User) => void;
    displayErrorMessage: (message: string) => void;
}

export class UserNavigationPresenter {
    private view: UserNavigationView;
    private userService: UserService;

    public constructor(view: UserNavigationView) {
        this.view = view;
        this.userService = new UserService();
    }

    public async navigateToUser(authToken: AuthToken, currentUser: User | null, alias: string) {
        try {
            const user = await this.userService.getUser(authToken, alias);

            if (!!user) {
              if (currentUser && currentUser.alias === user.alias) {
                this.view.setDisplayedUser(currentUser);
              } else {
                this.view.setDisplayedUser(user);
              }
            }
          } catch (error) {
            this.view.displayErrorMessage(`Failed to get user because of exception: ${error}`);
          }
    }

    public extractAlias(value: string): string {
        const index = value.indexOf("@");
        return value.substring(index);
    }
}