const bodyParser = require('body-parser');
const logger = require('../helper/logger');

function logError(err, req, res, next) {
  logger.error(err);
  next(err);
}

function errorHandler(err, req, res) {
  res.sendStatus(500);
}

function checkContentType(req, res, next) {
  req.accepts('application/json');
  next();
}

module.exports = {
  beforeRouter: (app) => {
    app.disable('x-powered-by');
    app.use(checkContentType);
    app.use(bodyParser.json());
  },
  afterRouter: (app) => {
    app.use(logError);
    app.use(errorHandler);
  },
};
