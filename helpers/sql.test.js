const { sqlForPartialUpdate, filterToSql } = require("./sql");

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
        expect(() => {
            sqlForPartialUpdate({}, { prop2: 'prop_2' });
        }).toThrow('No data');
    });
});


describe('create a filter string', () => {
    test('one parameter passed', () => {
        const string = filterToSql({
            nameLike: 'Me'
        });

        expect(string).toEqual(`lower(name) LIKE '%me%'`);
    });

    test('more than one parameter passed', () => {
        const string = filterToSql({
            nameLike: 'Me',
            minEmployees: 300
        });

        expect(string).toEqual(`lower(name) LIKE '%me%' AND num_employees >= 300`);
    });

    test('min larger than max (should error)', () => {
        expect(() => {
            filterToSql({ minEmployees: 300, maxEmployees: 200 });
        }).toThrow('MinEmployees cannot be larger than MaxEmployees')
    });
});