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
  let cols;
  if (jsToSql) {
    cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );
  } else {
    cols = keys.map((colName, idx) =>
    `"${colName}"=$${idx + 1}`,
    );
  }

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


/** Constructs a WHERE clause for query insertion.
 * 
 * The incoming query object is converted to a formatted string like so:
 * 
 * {name: 'Ba', maxEmployees: '300'} => "lower(name) LIKE '%ba%' AND num_employees <= 300"
 * 
 * If both max and min parameters are passed, then their values are typecast to Number and
 * compared to make sure min is not larger than or equal to max.
 */

function filterToSql(filters) {
  let filterArray = [];
  const keys = Object.keys(filters);
  const values = Object.values(filters);

  if (+filters['minEmployees'] >= +filters['maxEmployees']) {
    throw new BadRequestError('MinEmployees cannot be larger than MaxEmployees');
  }

  for (let i = 0; i < keys.length; i++) {
    switch (keys[i]) {
      case 'nameLike':
        filterArray.push(`lower(name) LIKE '%${values[i].toLowerCase()}%'`);
        break;
      case 'minEmployees':
        filterArray.push(`num_employees >= ${values[i]}`);
        break;
      case 'maxEmployees':
        filterArray.push(`num_employees <= ${values[i]}`);
        break;
      case 'titleLike':
        filterArray.push(`lower(title) LIKE '%${values[i].toLowerCase()}%'`);
        break;
      case 'minSalary':
        filterArray.push(`salary >= ${values[i]}`);
        break;
      case 'hasEquity':
        if (values[i] === 'true') {
          filterArray.push(`equity > 0`);
        }
        break;
    }
  }

  return filterArray.join(' AND ');
}

module.exports = { 
  sqlForPartialUpdate,
  filterToSql
};
