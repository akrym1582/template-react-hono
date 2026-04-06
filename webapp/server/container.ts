import "reflect-metadata";
import { Container } from "inversify";
import { UserRepository } from "./repositories/user.repository.js";
import { AuthService } from "./services/auth.service.js";
import { UserService } from "./services/user.service.js";

const userRepository = new UserRepository();

export const serverContainer = new Container();

serverContainer.bind(UserRepository).toConstantValue(userRepository);
serverContainer.bind(UserService).toConstantValue(new UserService(userRepository));
serverContainer.bind(AuthService).toConstantValue(new AuthService(userRepository));
