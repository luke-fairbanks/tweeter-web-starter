import { FollowService } from "../service/FollowService";
import { StatusService } from "../service/StatusService";
import { UserService } from "../service/UserService";
import { AuthorizationService } from "../service/AuthorizationService";
import { DAOFactory, createDefaultDAOFactory } from "./DAOFactory";

export class ServiceFactory {
  private static daoFactory: DAOFactory = createDefaultDAOFactory();

  public static setDAOFactory(daoFactory: DAOFactory): void {
    ServiceFactory.daoFactory = daoFactory;
  }

  public static createUserService(): UserService {
    return new UserService(
      ServiceFactory.daoFactory.createUserDAO(),
      ServiceFactory.daoFactory.createAuthDAO()
    );
  }

  public static createFollowService(): FollowService {
    return new FollowService(ServiceFactory.daoFactory.createFollowDAO());
  }

  public static createStatusService(): StatusService {
    return new StatusService(ServiceFactory.daoFactory.createStatusDAO());
  }

  public static createAuthorizationService(): AuthorizationService {
    return new AuthorizationService(ServiceFactory.daoFactory.createSessionDAO());
  }
}
