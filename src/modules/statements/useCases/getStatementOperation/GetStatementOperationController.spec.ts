import createConnection from "../../../../database";
import response from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";

describe("Get Statement Operation Controller", () => {
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

  it("should be able get statement operators", async () => {
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

    const getStatement = await response(app)
      .get(`/api/v1/statements/${statement.body.id}`)
      .set({ Authorization: `Bearer ${token.body.token}` });

    expect(getStatement.status).toBe(200);
    expect(getStatement.body.id).toBe(statement.body.id);
    expect(getStatement.body).toHaveProperty("created_at");
    expect(getStatement.body).toHaveProperty("updated_at");
  });
});
