import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Test UseCase of the Get Statement Operation", () => {
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able get statement operation", async () => {
    const user = await inMemoryUsersRepository.create(mokeAuth);

    const statementOperation = await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      amount: 220,
      description: "rental house",
      type: OperationType.WITHDRAW,
    });

    const getStatement = await getStatementOperationUseCase.execute({
      statement_id: String(statementOperation.id),
      user_id: String(user.id),
    });

    expect(getStatement).toHaveProperty("type");
    expect(getStatement).toHaveProperty("user_id");
    expect(getStatement.id).toBe(statementOperation.id);
    expect(getStatement.user_id).toBe(user.id);
  });

  it("should not be able get statement if user not found", () => {
    expect(async () => {
      const user = { id: "uuid" };

      const statementOperation = await inMemoryStatementsRepository.create({
        user_id: String(user.id),
        amount: 220,
        description: "rental house",
        type: OperationType.WITHDRAW,
      });

      await getStatementOperationUseCase.execute({
        statement_id: String(statementOperation.id),
        user_id: String(user.id),
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able get statement if statement not found", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create(mokeAuth);
      const statementOperation = { id: "uuidStatement" };

      await getStatementOperationUseCase.execute({
        statement_id: String(statementOperation.id),
        user_id: String(user.id),
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
