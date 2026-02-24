import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import "@testing-library/jest-dom"
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import PostStatus from '../../../src/components/postStatus/PostStatus';
import { PostStatusPresenter } from '../../../src/presenter/PostStatusPresenter';
import { AuthToken } from 'tweeter-shared';
import { User } from 'tweeter-shared';
import { UserInfoContext } from '../../../src/components/userInfo/UserInfoContexts';
import { instance, mock, verify } from '@typestrong/ts-mockito';
import { useUserInfo } from '../../../src/components/userInfo/UserHooks';

library.add(fab);

jest.mock("../../../src/components/userInfo/UserHooks", () => ({
    ...jest.requireActual("../../../src/components/userInfo/UserHooks"),
    __esModule: true,
    useUserInfo: jest.fn(),
}))

let mockUser = mock<User>();
let mockUserInstance = instance(mockUser);

let mockAuthToken = mock<AuthToken>();
let mockAuthTokenInstance = instance(mockAuthToken);

describe("PostStatus component", () => {

    beforeAll(() => {
        (useUserInfo as jest.Mock).mockReturnValue({
            currentUser: mockUserInstance,
            authToken: mockAuthTokenInstance
        })
    });

    it("starts with the post and clear buttons disabled", () => {
        const { postButton, clearButton } = renderPostStatusAndGetElements();

        expect(postButton).toBeDisabled();
        expect(clearButton).toBeDisabled();
    });

    it ("enables the post and clear buttons when text is entered into the post text area", async () => {
        const { user, postTextArea, postButton, clearButton } = renderPostStatusAndGetElements();

        await user.type(postTextArea, "This is a test post");

        expect(postButton).toBeEnabled();
        expect(clearButton).toBeEnabled();
    });

    it("disables the post and clear buttons when the post text area is cleared", async () => {
        const { user, postTextArea, postButton, clearButton } = renderPostStatusAndGetElements();

        await user.type(postTextArea, "This is a test post");

        expect(postButton).toBeEnabled();
        expect(clearButton).toBeEnabled();

        await user.clear(postTextArea);

        expect(postButton).toBeDisabled();
        expect(clearButton).toBeDisabled();
    });

    it("calls the presenters submitPost method with correct parameters when the post button is pressed", async () => {
        const mockPresenter  = mock<PostStatusPresenter>();
        const mockPresenterInstance = instance(mockPresenter);

        const postText = "This is a test post";

        const { user, postTextArea, postButton } = renderPostStatusAndGetElements(mockPresenterInstance);

        await user.type(postTextArea, postText);
        await user.click(postButton);

        verify(mockPresenter.submitPost(postText, mockAuthTokenInstance, mockUserInstance)).once();
    });

});

function renderPostStatus(presenter?: PostStatusPresenter) {
    return render(
        <MemoryRouter>
            <UserInfoContext.Provider value={{ currentUser: mockUserInstance, displayedUser: mockUserInstance, authToken: mockAuthTokenInstance }}>
                {!!presenter ? <PostStatus presenter={presenter} /> : <PostStatus />}
            </UserInfoContext.Provider>
        </MemoryRouter>
    )
}

function renderPostStatusAndGetElements(presenter?: PostStatusPresenter) {
    const user = userEvent.setup();
    renderPostStatus(presenter);

    const postTextArea = screen.getByPlaceholderText("What's on your mind?") as HTMLTextAreaElement;
    const postButton = screen.getByRole("button", { name: "Post Status" });
    const clearButton = screen.getByRole("button", { name: "Clear" });

    return {
        user,
        postTextArea,
        postButton,
        clearButton
    }
}
