import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Test UseCase of the user profile", () => {
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
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });
  it("should be able list all users but need is authenticated", async () => {
    await createUserUseCase.execute(mokeAuth);
    const userToken = await authenticateUserUseCase.execute({
      email: mokeAuth.email,
      password: mokeAuth.password,
    });

    const user = await showUserProfileUseCase.execute(
      String(userToken.user.id)
    );
    expect(user).toHaveProperty("id");
    expect(user.id).toBe(userToken.user.id);
    expect(user.email).toBe(mokeAuth.email);
  });

  it("should not be able list all users if user not exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("uuid");
    }).rejects.toBeInstanceOf(AppError);
  });
});
