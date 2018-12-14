const fs = require('fs');
const path = require('path');
const request = require('request');
const async = require('async');
const yauzl = require('yauzl');

const elencoComuniUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';
const fileOutComuni = 'data/comuni.csv';

const elencoComuniOldUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-soppressi.zip';
const fileOutComuniOldCsv = 'data/comuni-old.csv';
const fileOutComuniOld = 'data/comuni-old.zip';

const elencoComuniRenameddUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-denominazioni-precedenti.zip';
const fileOutComuniRenamed = 'data/comuni-renamed.zip';
const fileOutComuniRenamedCsv = 'data/comuni-renamed.csv';

async.series([
  function(cb) {
    getElencoComuni(elencoComuniUrl, fileOutComuni, cb);
  },
  function(cb) {
    getElencoComuni(elencoComuniOldUrl, fileOutComuniOld, cb);
  },
  function(cb) {
    unzip(fileOutComuniOld, fileOutComuniOldCsv, cb);
  },
  function(cb) {
    getElencoComuni(elencoComuniRenameddUrl, fileOutComuniRenamed, cb);
  },
  function(cb) {
    unzip(fileOutComuniRenamed, fileOutComuniRenamedCsv, cb);
  },
  function(cb) {
    checkFiles([
      fileOutComuni,
      fileOutComuniOldCsv,
      fileOutComuniRenamedCsv,
    ], cb);
  },
], function(err) {
  if (err) {
    return console.log(err);
  } else {
    console.log('DONE');
  }
});

function checkFiles(files, cb) {
  let globalError;
  const checkedFiles = files.map(function(file) {
    let error;
    if (!fs.existsSync(file)) {
      error = true;
      globalError = true;
    }
    return {
      file: file,
      error: error,
    };
  });

  if (globalError) {
    return cb(checkedFiles);
  }
  return cb();
}

function getElencoComuni(url, output, cb) {
  request
    .get(url)
    .on('error', function(err) {
      cb(err);
    })
    .on('end', function() {
      cb();
    })
    .pipe(fs.createWriteStream(output));
}

function unzip(input, output, cb) {
  yauzl.open(input, {lazyEntries: true}, function(err, zipfile) {
    if (err) {
      cb(err);
    }
    zipfile.readEntry();
    zipfile.on('entry', function(entry) {
      if (/\/$/.test(entry.fileName)) {
        // Directory file names end with '/'.
        // Note that entires for directories themselves are optional.
        // An entry's fileName implicitly requires its parent directories to exist.
        zipfile.readEntry();
      } else {
        // file entry
        zipfile.openReadStream(entry, function(err, readStream) {
          if (err) {
            cb(err);
          }
          readStream.on('end', function() {
            zipfile.readEntry();
          });

          if (path.extname(entry.fileName) === '.csv') {
            readStream.pipe(fs.createWriteStream(output));
          } else {
            cb();
          }
        });
      }
    });
  });
}
