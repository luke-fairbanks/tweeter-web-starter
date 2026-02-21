import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { MessageView, Presenter } from "./Presenter";

export interface PostStatusView extends MessageView{
    setPost: (postText: string) => void
    setIsLoading: (isLoading: boolean) => void
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
    private statusService: StatusService;

    public constructor(view: PostStatusView) {
        super(view)
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

        await this.doFailureReportingOperation(
            async () => {
                this.view.setIsLoading(true);
                postingStatusToastId = this.view.displayInfoMessage("Posting status...", 0);

                const status = new Status(post, currentUser, Date.now());

                await this.statusService.postStatus(authToken, status);

                this.view.setPost("");
                this.view.displayInfoMessage("Status posted!", 2000);
            },
            "post status",
            () => {
                if (postingStatusToastId) {
                    this.view.deleteMessage(postingStatusToastId);
                }
                this.view.setIsLoading(false);
            }
        );
    };
}
