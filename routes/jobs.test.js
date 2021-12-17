"use strict";

process.env.NODE_ENV = 'test';

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");
const req = require("express/lib/request");
const Job = require("../models/job");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    id: 4,
    title: 'j4',
    salary: 4,
    equity: '0.4',
    companyHandle: 'c1'
  };

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: 'Unauthorized',
        status: 401
      }
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          handle: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body.jobs.length).toEqual(3);
  });

  test('ok with one filter', async function () {
    const resp = await request(app).get('/jobs?titleLike=j1');
    expect(resp.body.jobs.length).toEqual(1);
  });

//   test('failes if max and min violate constraint', async function () {
//     const resp = await request(app).get('/jobs?');
//     expect(resp.body).toEqual({
//       error: {
//         message: 'MinEmployees cannot be larger than MaxEmployees',
//         status: 400
//       }
//     });
//   });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
    const newJob = {
        title: 'j4',
        salary: 4,
        equity: '0.4',
        companyHandle: 'c1'
      };

    test("works for anon", async function () {
        const job = await Job.create(newJob);
        const resp = await request(app).get(`/jobs/${job.id}`);
        expect(resp.body).toEqual({
            job: {
                id: job.id,
                title: "j4",
                salary: 4,
                equity: "0.4",
                companyHandle: "c1",
            },
        });
    });

    test("not found for no such company", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
    const newJob = {
        title: 'j4',
        salary: 4,
        equity: '0.4',
        companyHandle: 'c1'
      };

    test("works for admin", async function () {
        const job = await Job.create(newJob);
        const resp = await request(app)
            .patch(`/jobs/${job.id}`)
            .send({
                title: "j4-new",
            })
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.body).toEqual({
            job: {
                id: job.id,
                title: 'j4-new',
                salary: 4,
                equity: '0.4',
                companyHandle: 'c1'
            },
        });
    });

  test("unauth for anon", async function () {
    const job = await Job.create(newJob);
    const resp = await request(app)
        .patch(`/jobs/${job.id}`)
        .send({
          name: "j4-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request on id change attempt", async function () {
    const job = await Job.create(newJob);
    const resp = await request(app)
        .patch(`/jobs/${job.id}`)
        .send({
          companyHandle: 'c2',
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
    const newJob = {
        title: 'j4',
        salary: 4,
        equity: '0.4',
        companyHandle: 'c1'
    };

    test("works for admin users", async function () {
        const job = await Job.create(newJob);
        const resp = await request(app)
            .delete(`/jobs/${job.id}`)
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.body).toEqual({ deleted: `${job.id}` });
    });

    test("unauth for anon", async function () {
        const job = await Job.create(newJob);
        const resp = await request(app)
            .delete(`/jobs/${job.id}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such company", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(404);
    });
});
