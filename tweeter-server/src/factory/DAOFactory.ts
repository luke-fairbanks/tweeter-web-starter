import { FakeFollowDAO } from "../dao/fake/FakeFollowDAO";
import { FakeImageDAO } from "../dao/fake/FakeImageDAO";
import { FakeSessionDAO } from "../dao/fake/FakeSessionDAO";
import { FakeStatusDAO } from "../dao/fake/FakeStatusDAO";
import { FakeUserDAO } from "../dao/fake/FakeUserDAO";
import { DynamoDBFollowDAO } from "../dao/dynamodb/DynamoDBFollowDAO";
import { DynamoDBSessionDAO } from "../dao/dynamodb/DynamoDBSessionDAO";
import { DynamoDBStatusDAO } from "../dao/dynamodb/DynamoDBStatusDAO";
import { DynamoDBUserDAO } from "../dao/dynamodb/DynamoDBUserDAO";
import { S3ImageDAO } from "../dao/s3/S3ImageDAO";
import { FollowDAO } from "../dao/interfaces/FollowDAO";
import { ImageDAO } from "../dao/interfaces/ImageDAO";
import { SessionDAO } from "../dao/interfaces/SessionDAO";
import { StatusDAO } from "../dao/interfaces/StatusDAO";
import { UserDAO } from "../dao/interfaces/UserDAO";
import { Env } from "../config/Env";

export interface DAOFactory {
  createUserDAO(): UserDAO;
  createFollowDAO(): FollowDAO;
  createStatusDAO(): StatusDAO;
  createSessionDAO(): SessionDAO;
  createImageDAO(): ImageDAO;
}

export class FakeDAOFactory implements DAOFactory {
  public createUserDAO(): UserDAO {
    return new FakeUserDAO();
  }

  public createFollowDAO(): FollowDAO {
    return new FakeFollowDAO();
  }

  public createStatusDAO(): StatusDAO {
    return new FakeStatusDAO();
  }

  public createSessionDAO(): SessionDAO {
    return new FakeSessionDAO();
  }

  public createImageDAO(): ImageDAO {
    return new FakeImageDAO();
  }
}

export class DynamoDBDAOFactory implements DAOFactory {
  private userDAO = new DynamoDBUserDAO();
  private sessionDAO = new DynamoDBSessionDAO();
  private imageDAO = new S3ImageDAO();
  private followDAO = new DynamoDBFollowDAO();
  private statusDAO = new DynamoDBStatusDAO();

  public createUserDAO(): UserDAO {
    return this.userDAO;
  }

  public createFollowDAO(): FollowDAO {
    return this.followDAO;
  }

  public createStatusDAO(): StatusDAO {
    return this.statusDAO;
  }

  public createSessionDAO(): SessionDAO {
    return this.sessionDAO;
  }

  public createImageDAO(): ImageDAO {
    return this.imageDAO;
  }
}

export function createDefaultDAOFactory(): DAOFactory {
  const useFakeDAO = Env.isTrue("USE_FAKE_DAO", true);
  return useFakeDAO ? new FakeDAOFactory() : new DynamoDBDAOFactory();
}
