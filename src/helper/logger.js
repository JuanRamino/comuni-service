const pino = require('pino');

const stream = process.stdout;

module.exports = pino({}, stream);
