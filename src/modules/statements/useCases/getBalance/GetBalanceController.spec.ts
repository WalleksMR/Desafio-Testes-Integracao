import { Connection } from "typeorm";
import createConnection from "../../../../database";
import response from "supertest";
import { app } from "../../../../app";

describe("Get Balance Controller", () => {
  let connection: Connection;
  const mokeUser = {
    name: "user Moke",
    email: "user@example.com",
    password: "passwordMokeuser",
  };

  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able get balance", async () => {
    const user = await response(app).post("/api/v1/users").send(mokeUser);

    const userSession = await response(app)
      .post("/api/v1/sessions")
      .send({ email: mokeUser.email, password: mokeUser.password });

    await response(app)
      .post("/api/v1/statements/deposit")
      .send({
        user_id: String(user.body.id),
        amount: 900,
        description: "Create Statemnt Deposit",
        type: OperationType.DEPOSIT,
      })
      .set({ Authorization: `Bearer ${userSession.body.token}` });

    await response(app)
      .post("/api/v1/statements/withdraw")
      .send({
        user_id: String(user.body.id),
        amount: 240,
        description: "Rental car",
        type: OperationType.WITHDRAW,
      })
      .set({ Authorization: `Bearer ${userSession.body.token}` });

    await response(app)
      .post("/api/v1/statements/withdraw")
      .send({
        user_id: String(user.body.id),
        amount: 350,
        description: "Rental house",
        type: OperationType.WITHDRAW,
      })
      .set({ Authorization: `Bearer ${userSession.body.token}` });

    const balance = await response(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${userSession.body.token}`,
      });

    expect(balance.status).toBe(200);
    expect(balance.body).toHaveProperty("statement");
    expect(balance.body).toHaveProperty("balance");
    expect(balance.body.statement.length).toBe(3);
    expect(balance.body.balance).toBe(310);
  });

  it("should not be able get balance if user not exists", async () => {
    const userSession = await response(app)
      .post("/api/v1/sessions")
      .send({ email: "userNotExists", password: "passwordOfUserNotExists" });

    const balance = await response(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${userSession.body.token}`,
      });
    expect(balance.status).toBe(401);
    expect(balance.body).toHaveProperty("message");
  });
});
