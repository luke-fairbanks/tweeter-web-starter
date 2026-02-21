import { Service } from "../model.service/Service";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";
import { AuthToken, User } from "tweeter-shared";

export interface PagedItemView<T> extends View {
    addItems: (items: T[]) => void;
    setDisplayedUser: (user: User) => void;
}

export const PAGE_SIZE = 10;

export abstract class PagedItemPresenter<T, U extends Service> extends Presenter<PagedItemView<T>> {

    private _hasMoreItems = true;
    private _lastItem: T | null = null;
    private _service: U;
    private userService = new UserService();

    public constructor(view: PagedItemView<T>) {
        super(view);
        this._service = this.serviceFactory();
    }

    protected abstract serviceFactory(): U;


    protected get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(lastItem: T | null) {
        this._lastItem = lastItem;
    }

    protected get service() {
        return this._service
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

    public async loadMoreItems (authToken: AuthToken, userAlias: string) {
        await this.doFailureReportingOperation(async () => {
            const [newItems, hasMore] = await this.getMoreItems(
                authToken,
                userAlias,
            );

            this.hasMoreItems = hasMore;
            this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
            this.view.addItems(newItems);
        }, this.itemDescription());
    };

    protected abstract itemDescription(): string;

    protected abstract getMoreItems(authToken: AuthToken, userAlias: string): Promise<[T[], boolean]>;

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

        await this.doFailureReportingOperation(async () => {
            const toUser = await this.userService.getUser(authToken, displayedUserAliasParam);
            if (toUser) {
                this.view.setDisplayedUser(toUser);
            }
        }, "get user");
    }

}
