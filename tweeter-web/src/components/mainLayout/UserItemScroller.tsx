import { User } from "tweeter-shared";
import UserItem from "../userItem/UserItem";
import ItemScroller from "./ItemScroller";
import { UserItemPresenter } from "../../presenter/UserItemPresenter";
import { PagedItemView } from "../../presenter/PagedItemPresenter";

interface Props {
  featureUrl: string;
  presenterFactory: (view: PagedItemView<User>) => UserItemPresenter;
}

const UserItemScroller = (props: Props) => {
  return (
    <ItemScroller<User, UserItemPresenter>
      presenterFactory={props.presenterFactory}
      renderItem={(item) => (
        <div className="row mb-3 mx-0 px-0 border rounded bg-white">
          <UserItem user={item} featurePath={props.featureUrl} />
        </div>
      )}
    />
  );
};

export default UserItemScroller;
