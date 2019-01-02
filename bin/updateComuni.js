#!/usr/bin/env node

const updater = require('../src/comuniUpdater');

updater((err) => {
  console.log(err || 'DONE');
});
