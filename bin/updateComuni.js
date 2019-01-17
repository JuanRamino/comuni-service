#!/usr/bin/env node

const { spawn } = require('child_process');
const updater = require('../src/comuniUpdater');
const pm2Config = require('../processes');
const appName = pm2Config.apps[0].name;

updater((err) => {

  if (err === true) {
    console.log('Import process complete. File updated, restarting the service\n');

    const updateComuni = spawn('/usr/bin/env', ['pm2', 'restart', appName]);
    updateComuni.stderr.on('data', (data) => {
      console.log(`Error: ${data}`);
    });
    updateComuni.stdout.on('data', (data) => {
      console.log(data);
    });
    updateComuni.on('close', (code) => {
      const message = code === 0 ? 'Restart done with success' : `Restart done with error code ${code}`;
      console.log(message);
    });
  } else if (err === null) {
    console.log('Import process complete. File not changed, not restart needed');
  } else {
    console.log('Error during import process: ', err);
  }
});
