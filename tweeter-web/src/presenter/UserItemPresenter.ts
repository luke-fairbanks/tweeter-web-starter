import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";


export interface UserItemView {
    addItems: (items: User[]) => void;
    displayErrorMessage: (message: string) => void;
    setDisplayedUser: (user: User) => void;
}

export abstract class UserItemPresenter {
    private _hasMoreItems = true;
    private _lastItem: User | null = null;
    private _view: UserItemView;
    private userService: UserService;


    protected constructor(view: UserItemView) {
        this._view = view;
        this.userService = new UserService();
    }
    protected get view(){
        return this._view
    }

    protected get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(lastItem: User | null) {
        this._lastItem = lastItem;
    }

    protected set hasMoreItems(hasMoreItems: boolean) {
        this._hasMoreItems = hasMoreItems;
    }

    public get hasMoreItems() {
        return this._hasMoreItems;
    }

    reset() {
      this._lastItem = null;
      this._hasMoreItems = true;
    }

    public abstract loadMoreItems (authToken: AuthToken, userAlias: string) : Promise<void>;

    public async updateDisplayedUserFromRoute(
        authToken: AuthToken | null,
        displayedUserAliasParam: string | undefined,
        displayedUser: User | null
    ): Promise<void> {
        if (
            !authToken ||
            !displayedUserAliasParam ||
            displayedUserAliasParam === displayedUser?.alias
        ) {
            return;
        }

        try {
            const toUser = await this.userService.getUser(authToken, displayedUserAliasParam);
            if (toUser) {
                this.view.setDisplayedUser(toUser);
            }
        } catch (error) {
            this.view.displayErrorMessage(
                `Failed to get user because of exception: ${error}`
            );
        }
    }
}
