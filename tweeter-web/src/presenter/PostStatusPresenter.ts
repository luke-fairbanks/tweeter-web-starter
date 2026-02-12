import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";

export interface PostStatusView {
    displayErrorMessage: (message: string) => void
    displayInfoMessage: (message: string, duration: number) => string
    setPost: (postText: string) => void
    setIsLoading: (isLoading: boolean) => void
    deleteMessage: (messageId: string) => void
}

export class PostStatusPresenter {
    private view: PostStatusView;
    private statusService: StatusService;

    public constructor(view: PostStatusView) {
        this.view = view;
        this.statusService = new StatusService();
    }

    public isPostDisabled(
        post: string,
        authToken: AuthToken | null,
        currentUser: User | null
    ): boolean {
        return !post.trim() || !authToken || !currentUser;
    }

    public async submitPost (
        post: string,
        authToken: AuthToken,
        currentUser: User
    ) {
        let postingStatusToastId: string = "";
        try {
        this.view.setIsLoading(true);
        postingStatusToastId = this.view.displayInfoMessage("Posting status...", 0);

        const status = new Status(post, currentUser!, Date.now());

        await this.statusService.postStatus(authToken!, status);

        this.view.setPost("");
        this.view.displayInfoMessage("Status posted!", 2000);
        } catch (error) {
       this.view.displayErrorMessage(
            `Failed to post the status because of exception: ${error}`
        );
        } finally {
        this.view.deleteMessage(postingStatusToastId);
        this.view.setIsLoading(false);
        }
    };
}
