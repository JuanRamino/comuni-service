require('dotenv').config();

const fs = require('fs');
const should = require('chai').should(); // eslint-disable-line
const updater = require('../src/comuniUpdater');


module.exports = function() {
  this.timeout(10000);

  const dataPath = `${__dirname}/../data`;
  const { COMUNI_JSON_FILE } = process.env;
  const jsonFile = `${dataPath}/${COMUNI_JSON_FILE}`;
  const jsonFileBk = `${jsonFile}.bk`;

  const jsonExists = fs.existsSync(jsonFile);

  if (jsonExists) {
    describe('when json data already exists', function() {
      before(function () {
        fs.copyFileSync(jsonFile, jsonFileBk);
      });

      after(function () {
        fs.renameSync(jsonFileBk, jsonFile);
      });

      it('update without errors', (done) => {
        updater((err) => {
          if (err) {
            err.should.be.equal(true);
          }
          done();
        });
      });
    });

  } else {
    describe('when there is no json data', function () {
      it('update without errors', (done) => {
        updater((err) => {
          err.should.be.equal(true);
          done();
        });
      });
    });
  }
};
