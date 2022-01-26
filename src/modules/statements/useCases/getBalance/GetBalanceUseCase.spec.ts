import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Test UseCase of the Get Balance ", () => {
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
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able get balance", async () => {
    const user = await inMemoryUsersRepository.create(mokeAuth);

    await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      amount: 110,
      description: "rental car",
      type: OperationType.WITHDRAW,
    });

    await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      amount: 3700,
      description: "Salary",
      type: OperationType.DEPOSIT,
    });
    const getBalance = await getBalanceUseCase.execute({
      user_id: String(user.id),
    });

    expect(getBalance).toHaveProperty("balance");
    expect(getBalance).toHaveProperty("statement");
    expect(getBalance.statement[0].user_id).toBe(user.id);
    expect(getBalance.statement.length).toBe(2);
  });

  it("should not be able get balance if user not found", () => {
    expect(async () => {
      const user = { id: "uuid" };

      await getBalanceUseCase.execute({
        user_id: String(user.id),
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
