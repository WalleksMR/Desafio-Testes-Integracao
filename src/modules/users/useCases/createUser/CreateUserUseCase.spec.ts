import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Test UseCase of the User", () => {
  const mokeUser = {
    name: "user Moke",
    email: "user@example.com",
    password: "passwordMokeuser",
  };
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able create a new user", async () => {
    const user = await createUserUseCase.execute(mokeUser);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe(mokeUser.name);
    expect([user].length).toBe(1);
  });

  it("should not be able create a new user same user exists", () => {
    expect(async () => {
      await createUserUseCase.execute(mokeUser);
      await createUserUseCase.execute(mokeUser);
    }).rejects.toBeInstanceOf(AppError);
  });
});
