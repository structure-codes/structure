import request from "supertest";
import { app } from "../src";

describe("hitting external APIs works", () => {  
  it("GET /api/templates", async () => {
    await request(app)
      .get("/api/templates")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);
  });
  it("GET /api/template/react-boilerplate", async () => {
    await request(app)
      .get("/api/template/react-boilerplate")
      .expect("Content-Type", /text/);
  });
  it("POST /api/github SUCCESS", async () => {
    await request(app)
      .post("/api/github")
      .send({
        owner: "structure-codes",
        repo: "structure",
        branch: null,
      })
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("POST /api/github INVALID REPO", async () => {
    await request(app)
      .post("/api/github")
      .send({
        owner: "structure-codes",
        repo: "structurestructurestructurestructure",
        branch: null,
      })
      .expect("Content-Type", /json/)
      .expect(404);
  });
  it("POST /api/github INVALID BRANCH", async () => {
    await request(app)
      .post("/api/github")
      .send({
        owner: "structure-codes",
        repo: "structure",
        branch: "3333333333333333333",
      })
      .expect("Content-Type", /json/)
      .expect(404);
  });
});
