import { Status } from "tweeter-shared";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import StatusItem from "../statusItem/StatusItem";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions, useUserNavigation } from "../userInfo/UserHooks";
import { StatusItemPresenter, StatusItemView } from "../../presenter/StatusItemPresenter";

interface Props {
    itemDescription: string;
    featureUrl: string;
    presenterFactory: (view: StatusItemView) => StatusItemPresenter
}

const StatusItemScroller = (props: Props) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<Status[]>([]);
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: StatusItemView = {
    addItems: (newItems: Status[]) => setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage: (message: string) => displayErrorMessage(message),
    setDisplayedUser: setDisplayedUser
  }
  const presenterRef = useRef<StatusItemPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenterFactory(listener);
  }

  const { navigateToUser } = useUserNavigation();

  // Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    presenterRef.current!.updateDisplayedUserFromRoute(
      authToken,
      displayedUserAliasParam,
      displayedUser
    );
  }, [authToken, displayedUserAliasParam, displayedUser]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = async () => {
    setItems(() => []);
    presenterRef.current!.reset();
  };

  const loadMoreItems = async () => {
    presenterRef.current!.loadMoreItems(authToken!, displayedUser!.alias);
  };

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={loadMoreItems}
        hasMore={presenterRef.current!.hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => (
          <StatusItem
            key={index}
            item={item}
            onUserNavigation={navigateToUser}
            featurePath={`${props.featureUrl}`}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default StatusItemScroller;
