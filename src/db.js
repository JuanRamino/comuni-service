require('dotenv').config();
const fs = require('fs');

const { COMUNI_JSON_FILE } = process.env;

module.exports = (() => {
  // console.log(process.env);
  const jsonPath = `${__dirname}/../data/${COMUNI_JSON_FILE}`;

  if (!fs.existsSync(jsonPath)) {
    throw new Error('comuni json file not found');
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf8');

  return JSON.parse(jsonData);
})();
