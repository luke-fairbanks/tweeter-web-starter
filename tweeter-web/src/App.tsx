import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import { useUserInfo } from "./components/userInfo/UserHooks";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import { StatusItemPresenter } from "./presenter/StatusItemPresenter";
import { UserItemPresenter } from "./presenter/UserItemPresenter";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { User } from "tweeter-shared/dist/model/domain/User";
import UserItemScroller from "./components/mainLayout/UserItemScroller";
import StatusItemScroller from "./components/mainLayout/StatusItemScroller";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  const createStatusRouteElement = (
    routeName: "feed" | "story",
    presenterFactory: (view: PagedItemView<Status>) => StatusItemPresenter
  ) => (
    <StatusItemScroller
      key={`${routeName}-${displayedUser!.alias}`}
      featureUrl={`/${routeName}`}
      presenterFactory={presenterFactory}
    />
  );

  const createUserRouteElement = (
    routeName: "followees" | "followers",
    presenterFactory: (view: PagedItemView<User>) => UserItemPresenter
  ) => (
    <UserItemScroller
      key={`${routeName}-${displayedUser!.alias}`}
      featureUrl={`/${routeName}`}
      presenterFactory={presenterFactory}
    />
  );

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
        <Route
          path="feed/:displayedUser"
          element={createStatusRouteElement(
            "feed",
            (view: PagedItemView<Status>) => new FeedPresenter(view)
          )}
        />
        <Route
          path="story/:displayedUser"
          element={createStatusRouteElement(
            "story",
            (view: PagedItemView<Status>) => new StoryPresenter(view)
          )}
        />
        <Route
          path="followees/:displayedUser"
          element={createUserRouteElement(
            "followees",
            (view: PagedItemView<User>) => new FolloweePresenter(view)
          )}
        />
        <Route
          path="followers/:displayedUser"
          element={createUserRouteElement(
            "followers",
            (view: PagedItemView<User>) => new FollowerPresenter(view)
          )}
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
