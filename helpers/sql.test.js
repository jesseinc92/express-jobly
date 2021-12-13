const { sqlForPartialUpdate } = require("./sql");

describe('create partial update object', () => {
    test('data to update', () => {
        const data = { prop1: 'test1', prop2: 'test2' };
        const sql = { prop3: 'test3', prop4: 'test4' };
        const object = sqlForPartialUpdate(data, sql);
        expect(object).toEqual({
            setCols: '"prop1"=$1, "prop2"=$2',
            values: ['test1', 'test2']
        });
    });

    test('data from js param to be updated', () => {
        const data = { prop1: 'test1', prop2: 'test2' };
        const sql = { prop2: 'prop_2' };
        const object = sqlForPartialUpdate(data, sql);
        expect(object).toEqual({
            setCols: '"prop1"=$1, "prop_2"=$2',
            values: ['test1', 'test2']
        });
    });
    
    test('no data to update', () => {
        // TODO: Write a test that expects and error
    });
});