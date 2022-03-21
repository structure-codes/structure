import request from "supertest";
import { app } from "../src";
import got from "got";
import { mocked } from "jest-mock";
import templateJson from "./templates.json";

jest.mock("got");
const mockedGot = mocked(got);
describe("GET /api/templates", () => {
  it("mocked", async () => { 
    mockedGot.mockReturnValueOnce({
      json: () => Promise.resolve(templateJson),
    } as any);
    await request(app)
      .get("/api/templates")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);
  });
});
