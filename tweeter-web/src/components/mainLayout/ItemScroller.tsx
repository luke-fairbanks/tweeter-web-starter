import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { Service } from "../../model.service/Service";
import { PagedItemPresenter, PagedItemView } from "../../presenter/PagedItemPresenter";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserHooks";

interface Props<T, P extends PagedItemPresenter<T, Service>> {
  presenterFactory: (view: PagedItemView<T>) => P;
  renderItem: (item: T) => JSX.Element;
}

const ItemScroller = <T, P extends PagedItemPresenter<T, Service>>(
  props: Props<T, P>
) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<T[]>([]);
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PagedItemView<T> = {
    addItems: (newItems: T[]) =>
      setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage: displayErrorMessage,
    setDisplayedUser: setDisplayedUser,
  };

  const presenterRef = useRef<P | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenterFactory(listener);
  }

  useEffect(() => {
    presenterRef.current!.updateDisplayedUserFromRoute(
      authToken,
      displayedUserAliasParam,
      displayedUser
    );
  }, [authToken, displayedUserAliasParam, displayedUser]);

  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = () => {
    setItems(() => []);
    presenterRef.current!.reset();
  };

  const loadMoreItems = async () => {
    await presenterRef.current!.loadMoreItems(authToken!, displayedUser!.alias);
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
          <div key={index}>
            {props.renderItem(item)}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ItemScroller;
