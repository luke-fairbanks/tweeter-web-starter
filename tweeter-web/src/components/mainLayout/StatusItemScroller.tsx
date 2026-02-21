import { Status } from "tweeter-shared";
import StatusItem from "../statusItem/StatusItem";
import { useUserNavigation } from "../userInfo/UserHooks";
import { StatusItemPresenter } from "../../presenter/StatusItemPresenter";
import { PagedItemView } from "../../presenter/PagedItemPresenter";
import ItemScroller from "./ItemScroller";

interface Props {
  featureUrl: string;
  presenterFactory: (view: PagedItemView<Status>) => StatusItemPresenter;
}

const StatusItemScroller = (props: Props) => {
  const { navigateToUser } = useUserNavigation();

  return (
    <ItemScroller<Status, StatusItemPresenter>
      presenterFactory={props.presenterFactory}
      renderItem={(item) => (
        <StatusItem
          item={item}
          onUserNavigation={navigateToUser}
          featurePath={props.featureUrl}
        />
      )}
    />
  );
};

export default StatusItemScroller;
