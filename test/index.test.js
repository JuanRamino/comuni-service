process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = require('chai').should();
const chaiHttp = require('chai-http');

const updateComuni = require('./updateComuni');

chai.use(chaiHttp);
chai.should();

describe('updateComuni', updateComuni);

describe('Routes', () => {
  let app;
  before(function () {
    app = require('../src/server');
  });

  it('should respond a 404 for not existing API', (done) => {
    const app = require('../src/server');
    chai.request(app)
      .get('/pippo')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  describe('Comuni', () => {
    describe('GET', () => {

      it('should get all comuni', (done) => {
        const app = require('../src/server');
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

      it('should filter by provincia', (done) => {
        const provincia = 'bs';
        const rightComune = 'brescia';
        chai.request(app)
          .get(`/comuni?provincia=${provincia}`)
          .end((err, res) => {
            res.body
              .filter((c) => c['Denominazione in italiano'].toLowerCase() === rightComune)
              .should.have.lengthOf(1);

            done();
          });
      });

      it('should filter by regione', (done) => {
        const regione = 'lombardia';
        const wrongComune = 'roma';
        chai.request(app)
          .get(`/comuni?regione=${regione}`)
          .end((err, res) => {
            res.body
              .filter((c) => c['Denominazione in italiano'].toLowerCase() === wrongComune)
              .should.have.lengthOf(0);

            done();
          });
      });
    });
  });

  describe('Regioni', () => {
    describe('GET', () => {

      it('should get regioni', (done) => {
        chai.request(app)
          .get('/regioni')
          .end((err, res) => {
            res.should.have.status(200);
            should.not.exist(err);
            res.body.should.be.a('array');
            done();
          });
      });
    });
  });

  describe('Province', () => {
    describe('GET', () => {

      it('should get province', (done) => {
        chai.request(app)
          .get('/province')
          .end((err, res) => {
            res.should.have.status(200);
            should.not.exist(err);
            res.body.should.be.a('array');
            done();
          });
      });
    });
  });
});
