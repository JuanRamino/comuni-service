const fs = require('fs');
const path = require('path');
const request = require('request');
const async = require('async');
const yauzl = require('yauzl');
const parse = require('csv-parse/lib/sync');

const elencoComuniUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';
const fileOutComuni = 'data/comuni.csv';

const elencoComuniOldUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-soppressi.zip';
const fileOutComuniOldCsv = 'data/comuni-old.csv';
const fileOutComuniOld = 'data/comuni-old.zip';

const elencoComuniRenameddUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-denominazioni-precedenti.zip';
const fileOutComuniRenamed = 'data/comuni-renamed.zip';
const fileOutComuniRenamedCsv = 'data/comuni-renamed.csv';

async.series([
  (cb) => {
    getElencoComuni(elencoComuniUrl, fileOutComuni, cb);
  },
  (cb) => {
    getElencoComuni(elencoComuniOldUrl, fileOutComuniOld, cb);
  },
  (cb) => {
    unzip(fileOutComuniOld, fileOutComuniOldCsv, cb);
  },
  (cb) => {
    getElencoComuni(elencoComuniRenameddUrl, fileOutComuniRenamed, cb);
  },
  (cb) => {
    unzip(fileOutComuniRenamed, fileOutComuniRenamedCsv, cb);
  },
  (cb) => {
    checkFiles([
      fileOutComuni,
      fileOutComuniOldCsv,
      fileOutComuniRenamedCsv,
    ], cb);
  },
  (cb) => {
    csvToJson(fileOutComuni, cb);
  },
], (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('DONE');
  }
});

function csvToJson(input, cb) {
  const csvToString = fs.readFileSync(input, 'utf8');
  // csvToString lose UTF8 encoding
  const comuni = parse(csvToString, { delimiter: ';', columns: true });

  console.log(comuni[0]);
  cb();
}

function checkFiles(files, cb) {
  let globalError;
  const checkedFiles = files.map((file) => {
    let error;
    if (!fs.existsSync(file)) {
      error = true;
      globalError = true;
    }
    return {
      file,
      error,
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
    .on('error', (err) => {
      cb(err);
    })
    .on('end', () => {
      cb();
    })
    .pipe(fs.createWriteStream(output));
}

function unzip(input, output, cb) {
  yauzl.open(input, {lazyEntries: true}, (err, zipfile) => {
    if (err) {
      return cb(err);
    }
    zipfile.readEntry();
    zipfile.on('entry', (entry) => {
      if (/\/$/.test(entry.fileName)) {
        // Directory file names end with '/'.
        // Note that entires for directories themselves are optional.
        // An entry's fileName implicitly requires its parent directories to exist.
        zipfile.readEntry();
      } else {
        // file entry
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            cb(err);
          }
          readStream.on('end', () => {
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
