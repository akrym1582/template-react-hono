import "reflect-metadata";
import { Container } from "inversify";
import { SampleItemRepository } from "./repositories/sample-item.repository.js";
import { UserRepository } from "./repositories/user.repository.js";
import { AuthService } from "./services/auth.service.js";
import { SampleItemService } from "./services/sample-item.service.js";
import { UserService } from "./services/user.service.js";

export const serverContainer = new Container();

serverContainer.bind(UserRepository).toDynamicValue(() => new UserRepository()).inSingletonScope();
serverContainer
  .bind(SampleItemRepository)
  .toDynamicValue(() => new SampleItemRepository())
  .inSingletonScope();
serverContainer
  .bind(UserService)
  .toDynamicValue((context) => new UserService(context.get(UserRepository)))
  .inSingletonScope();
serverContainer
  .bind(SampleItemService)
  .toDynamicValue((context) => new SampleItemService(context.get(SampleItemRepository)))
  .inSingletonScope();
serverContainer
  .bind(AuthService)
  .toDynamicValue((context) => new AuthService(context.get(UserRepository)))
  .inSingletonScope();
