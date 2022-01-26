import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Test UseCase of the Create Statement", () => {
  const mokeAuth = {
    name: "user Moke",
    email: "user@example.com",
    password: "passwordMokeuser",
  };
  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able create a new statement", async () => {
    const user = await inMemoryUsersRepository.create(mokeAuth);

    const createStatement = await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 200,
      description: "Create Statemnt",
      type: OperationType.DEPOSIT,
    });

    expect(createStatement).toHaveProperty("type");
    expect(createStatement).toHaveProperty("user_id");
    expect(createStatement.user_id).toBe(user.id);
  });

  it("should not be able create a new statement if insufficent funds", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create(mokeAuth);

      await createStatementUseCase.execute({
        user_id: String(user.id),
        amount: 200,
        description: "Create Statemnt",
        type: OperationType.DEPOSIT,
      });

      await createStatementUseCase.execute({
        user_id: String(user.id),
        amount: 400,
        description: "Withdraw Statemnt",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able create a new statement if user not found", () => {
    expect(async () => {
      const user = { id: "uuid" };

      await createStatementUseCase.execute({
        user_id: String(user.id),
        amount: 200,
        description: "Create Statemnt",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
