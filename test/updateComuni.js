process.env.NODE_ENV = 'test';

const should = require('chai').should();
const updater = require('../src/comuniUpdater');


describe('updateComuni', function() {
  this.timeout(10000);

  it('update without erros', (done) => {
    updater((err) => {
      should.not.exist(err);
      done();
    });
  });
});
