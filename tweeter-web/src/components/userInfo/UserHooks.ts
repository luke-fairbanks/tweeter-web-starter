import { useContext, useState } from "react";
import { UserInfoActionsContext, UserInfoContext } from "./UserInfoContexts";
import { useMessageActions } from "../toaster/MessageHooks";
import { UserNavigationPresenter, UserNavigationView } from "../../presenter/UserNavigationPresenter";

export const useUserInfoActions = () => {
  return useContext(UserInfoActionsContext);
}

export const useUserInfo = () => {
  return useContext(UserInfoContext);
}

export const useUserNavigation = () => {
  const { setDisplayedUser } = useUserInfoActions();
  const { currentUser, authToken } = useUserInfo();
  const { displayErrorMessage } = useMessageActions();

  const listener: UserNavigationView = {
    setDisplayedUser: setDisplayedUser,
    displayErrorMessage: displayErrorMessage
  };

  const [presenter] = useState(new UserNavigationPresenter(listener));

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    const alias = presenter.extractAlias(event.currentTarget.textContent || "");
    await presenter.navigateToUser(authToken!, currentUser, alias);
  };

  return { navigateToUser };
};