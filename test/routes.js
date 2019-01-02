process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = require('chai').should();
const chaiHttp = require('chai-http');


chai.use(chaiHttp);
chai.should();

const app = require('../src/server');

describe('Comuni', () => {
  describe('GET', () => {

    it('should get all comuni', (done) => {
      chai.request(app)
        .get('/comuni')
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.a('array');
          done();
        });
    });

    
    it('should get a single comune', (done) => {
      const comuneName = 'brescia';
      chai.request(app)
        .get(`/comuni/${comuneName}`)
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.a('object');
          done();
        });
    });

    it('should not get a single comune cause doesn\'t exist', (done) => {
      const comuneName = 'plutopippopaperino';
      chai.request(app)
        .get(`/comuni/${comuneName}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
    
  });
});