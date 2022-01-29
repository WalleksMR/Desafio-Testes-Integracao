import { Connection } from "typeorm";
import createConnection from "../../../../database";
import response from "supertest";
import { app } from "../../../../app";

describe("Create Statement Controller", () => {
  const mokeUser = {
    name: "user Moke",
    email: "user@example.com",
    password: "passwordMokeuser",
  };
  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  let connection: Connection;
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new statement deposit", async () => {
    const user = await response(app).post("/api/v1/users").send(mokeUser);
    const token = await response(app)
      .post("/api/v1/sessions")
      .send({ email: mokeUser.email, password: mokeUser.password });
    const statement = await response(app)
      .post("/api/v1/statements/deposit")
      .send({
        user_id: String(user.body.id),
        amount: 200,
        description: "Create Statemnt Deposit",
        type: OperationType.DEPOSIT,
      })
      .set({ Authorization: `Bearer ${token.body.token}` });

    expect(statement.status).toBe(201);
    expect(statement.body).toHaveProperty("id");
    expect(statement.body).toHaveProperty("user_id");
    expect(statement.body).toHaveProperty("type");
  });

  it("should not be able to create a new statement if insufficient funds", async () => {
    const user = await response(app).post("/api/v1/users").send(mokeUser);
    const token = await response(app)
      .post("/api/v1/sessions")
      .send({ email: mokeUser.email, password: mokeUser.password });

    const statement = await response(app)
      .post("/api/v1/statements/withdraw")
      .send({
        user_id: String(user.body.id),
        amount: 500,
        description: "Create Statemnt Withdraw",
        type: OperationType.WITHDRAW,
      })
      .set({ Authorization: `Bearer ${token.body.token}` });

    expect(statement.status).toBe(400);
    expect(statement.body).toHaveProperty("message");
    expect(statement.body.message).toBe("Insufficient funds");
  });
});
