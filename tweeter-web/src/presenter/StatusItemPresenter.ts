import { AuthToken, Status, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface StatusItemView {
    addItems: (items: Status[]) => void;
    displayErrorMessage: (message: string) => void;
    setDisplayedUser: (user: User) => void;
}

export abstract class StatusItemPresenter {
    private _view: StatusItemView;
    private _hasMoreItems: boolean = true;
    private _lastItem: Status | null = null;
    private userService: UserService;

    protected constructor(view: StatusItemView) {
        this._view = view;
        this.userService = new UserService();
    }

    protected get view() {
        return this._view
    }

    protected get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(status: Status | null) {
        this._lastItem = status;
    }

    protected set hasMoreItems(hasMore: boolean) {
        this._hasMoreItems = hasMore;
    }

    public get hasMoreItems() {
        return this._hasMoreItems;
    }

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

    public reset() {
        this._lastItem = null;
        this._hasMoreItems = true;
    }

    public abstract loadMoreItems(authToken: AuthToken, userAlias: string): Promise<void>;
}
