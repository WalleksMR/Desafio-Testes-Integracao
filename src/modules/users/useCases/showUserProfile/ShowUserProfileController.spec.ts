import response from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

describe("Show User Profile Controller", () => {
  let connection: Connection;
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  const userMoke = {
    name: "user Controller",
    email: "user@example.com",
    password: "password",
  };

  it("should be able list all users but need is authenticated POST /api/v1/sessions", async () => {
    await response(app).post("/api/v1/users").send(userMoke);
    const user = await response(app)
      .post("/api/v1/sessions")
      .send({ email: userMoke.email, password: userMoke.password });

    const listUser = await response(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Bearer ${user.body.token}` });

    expect(listUser.status).toBe(200);
    expect(listUser.body).toHaveProperty("id");
  });

  it("should not be able list all users case token is invalid POST /api/v1/sessions", async () => {
    const listUser = await response(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Bearer tokenInvalid` });

    expect(listUser.status).toBe(401);
  });
});
