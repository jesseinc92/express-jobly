"use strict";

process.env.NODE_ENV = 'test';

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe('create', function () {
    const newJob = {
        title: 'j4',
        salary: 4,
        equity: 0.4,
        companyHandle: 'c1'
    };

    test('works', async function () {
        let job = await Job.create(newJob);
        job.id = 4

        expect(job).toEqual({
            id: 4,
            title: 'j4',
            salary: 4,
            equity: '0.4',
            companyHandle: 'c1'
        });

        const result = await db.query(
            `SELECT title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE title = 'j4'`);
        expect(result.rows[0]).toEqual({
            title: 'j4',
            salary: 4,
            equity: '0.4',
            companyHandle: 'c1'
        });
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        jobs[0].id = 1;
        jobs[1].id = 2;
        jobs[2].id = 3;
 
        expect(jobs).toEqual([
            {
                id: 1,
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyHandle: 'c1'
            },
            {
                id: 2,
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyHandle: 'c2'
            },
            {
                id: 3,
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyHandle: 'c2'
            },
        ]);
    });
  
    // test('works: one filter', async function () {
    //   const filters = { nameLike: 'c2' };
    //   let companies = await Company.findAll(filters);
    //   expect(companies).toEqual([
    //     {
    //       handle: "c2",
    //       name: "C2",
    //       description: "Desc2",
    //       numEmployees: 2,
    //       logoUrl: "http://c2.img",
    //     }
    //   ]);
    // });
  
    // test('works: two filters', async function () {
    //   const filters = { minEmployees: 1, maxEmployees: 2 };
    //   let companies = await Company.findAll(filters);
    //   expect(companies).toEqual([
    //     {
    //       handle: "c1",
    //       name: "C1",
    //       description: "Desc1",
    //       numEmployees: 1,
    //       logoUrl: "http://c1.img",
    //     },
    //     {
    //       handle: "c2",
    //       name: "C2",
    //       description: "Desc2",
    //       numEmployees: 2,
    //       logoUrl: "http://c2.img",
    //     }
    //   ])
    // });
});
  
/************************************** get */
  
describe("get", function () {
    const newJob = {
        title: 'j4',
        salary: 4,
        equity: 0.4,
        companyHandle: 'c1'
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        let result = await Job.get(job.id);

        expect(job).toEqual({
            id: job.id,
            title: "j4",
            salary: 4,
            equity: "0.4",
            companyHandle: 'c1'
        });
    });
  
    test("not found if no such company", async function () {
      try {
        await Job.get(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
});
  
/************************************** update */
  
describe("update", function () {
    const newJob = {
        title: 'j4',
        salary: 4,
        equity: 0.4,
        companyHandle: 'c1'
    };

    const updateData = {
        title: 'new',
        salary: 100,
        equity: '0.5'
    };
  
    test("works", async function () {
      let nJob = await Job.create(newJob);
      let job = await Job.update(nJob.id, updateData);
      expect(job).toEqual({
        id: nJob.id,
        companyHandle: 'c1',
        ...updateData
      });
  
      const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`, [nJob.id]);
      expect(result.rows).toEqual([{
        id: nJob.id,
        title: 'new',
        salary: 100,
        equity: '0.5',
        companyHandle: 'c1'
      }]);
    });
  
    test("not found if no such company", async function () {
      try {
        await Job.update(0, updateData);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("bad request with no data", async function () {
      try {
        await Job.update("c1", {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
});

/************************************** remove */
  
describe("remove", function () {
    const newJob = {
        title: 'j4',
        salary: 4,
        equity: 0.4,
        companyHandle: 'c1'
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        await Job.remove(job.id);
        const res = await db.query(
            "SELECT id FROM jobs WHERE id = $1", [job.id]);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such company", async function () {
      try {
        await Job.remove(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
});
  