import { Connection } from "typeorm";
import createConnection from "../../../../database";
import response from "supertest";
import { app } from "../../../../app";

describe("Authenticate User Controller", () => {
  let connection: Connection;
  const userMoke = {
    name: "user Controller",
    email: "user@example.com",
    password: "password",
  };
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new token of the user", async () => {
    await response(app).post("/api/v1/users").send(userMoke);
    const userToken = await response(app)
      .post("/api/v1/sessions")
      .send({ email: userMoke.email, password: userMoke.password });

    expect(userToken.status).toBe(200);
    expect(userToken.body).toHaveProperty("token");
  });

  it("should not be able to create a new token if the incorrect password", async () => {
    await response(app).post("/api/v1/users").send(userMoke);
    const userToken = await response(app)
      .post("/api/v1/sessions")
      .send({ email: userMoke.email, password: "IncorrectPassword" });

    expect(userToken.status).toBe(401);
    expect(userToken.body.message).toBe("Incorrect email or password");
  });

  it("should not be able to create a new token if the incorrect email", async () => {
    await response(app).post("/api/v1/users").send(userMoke);
    const userToken = await response(app)
      .post("/api/v1/sessions")
      .send({ email: "emailIncorrect", password: userMoke.password });

    expect(userToken.status).toBe(401);
    expect(userToken.body.message).toBe("Incorrect email or password");
  });
});
