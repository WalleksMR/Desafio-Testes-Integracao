import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Test UseCase of the Authenticate", () => {
  const mokeAuth = {
    name: "user Moke",
    email: "user@example.com",
    password: "passwordMokeuser",
  };
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able create a new token of the user", async () => {
    await createUserUseCase.execute(mokeAuth);

    const userToken = await authenticateUserUseCase.execute({
      email: mokeAuth.email,
      password: mokeAuth.password,
    });
    expect(userToken).toHaveProperty("token");
    expect(userToken).toHaveProperty("user");
    expect(userToken.user.email).toBe(mokeAuth.email);
  });

  it("should not be able create a new token if the incorrect password", () => {
    expect(async () => {
      await createUserUseCase.execute(mokeAuth);
      await authenticateUserUseCase.execute({
        email: mokeAuth.email,
        password: "Incorrent Password",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able create a new token if the incorrect email", () => {
    expect(async () => {
      await createUserUseCase.execute(mokeAuth);
      await authenticateUserUseCase.execute({
        email: "User incorrect",
        password: mokeAuth.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
