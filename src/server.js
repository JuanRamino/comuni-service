require('dotenv').config();
const express = require('express');
const middleware = require('./middleware');

const app = express();
middleware.beforeRouter(app);
require('./router')(app);
middleware.afterRouter(app);

const { PORT, HOST } = process.env;

const server = app.listen(PORT, HOST);

module.exports = server;
