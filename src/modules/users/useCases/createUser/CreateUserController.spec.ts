import response from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
describe("Create User Controller", () => {
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

  it("should be able create a new user POST /api/v1/users", async () => {
    const user = await response(app).post("/api/v1/users").send(userMoke);
    expect(user.status).toBe(201);
  });
});
