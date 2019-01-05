#!/usr/bin/env node

const updater = require('../src/comuniUpdater');

updater((err) => {

  if (err === true) {
    console.log('Import process complete. File update, restart Needed');
  } else if (err === null) {
    console.log('Import process complete. File not changed, not restart needed');
  } else {
    console.log('Error during import process: ', err);
  }

});
