const { BadRequestError } = require("../expressError");

/** Return a list of properties and indices.
 * 
 * This function takes parameters and returns
 * an object with setCols to be put into the
 * query string with prop name and index number.
 * 
 * The values property contains the corresponding values 
 * to be put into the query string.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
