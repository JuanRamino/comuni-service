const fs = require('fs');
const path = require('path');
const request = require('request');
const async = require('async');
const yauzl = require('yauzl');
const parse = require('csv-parse/lib/sync');
const _ = require('lodash');
const iconv = require('iconv-lite');

const elencoComuniUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';
const fileOutComuni = 'data/tmp/comuni.csv';
const fileComuni = 'data/comuni.csv';

const elencoComuniOldUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-soppressi.zip';
const fileOutComuniOldCsv = 'data/tmp/comuni-old.csv';
const fileOutComuniOld = 'data/tmp/comuni-old.zip';
const fileComuniOld = 'data/comuni-old.csv';

const elencoComuniRenameddUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-denominazioni-precedenti.zip';
const fileOutComuniRenamed = 'data/tmp/comuni-renamed.zip';
const fileOutComuniRenamedCsv = 'data/tmp/comuni-renamed.csv';
const fileComuniRenamed = 'data/comuni-renamed.csv';

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
    fixEncoding([
      [fileOutComuni, fileComuni],
      [fileOutComuniOldCsv, fileComuniOld],
      [fileOutComuniRenamedCsv, fileComuniRenamed],
    ], cb);
  },
  (cb) => {
    csvToJson({
      comuni: fileComuni,
      comuniOld: fileComuniOld,
      comuniRenamed: fileComuniRenamed,
    }, cb);
  },
], (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('DONE');
  }
});

function csvToJson(mappedFiles, cb) {
  const parsed = _.mapValues(mappedFiles, (file) =>
    parse(fs.readFileSync(file, 'utf8'), { delimiter: ';', columns: true })
  );

  const { comuni, comuniOld, comuniRenamed } = parsed;

  comuniRenamed.forEach((comuneRenamed) => {
    const index = _.findIndex(comuni, ['Denominazione in italiano', comuneRenamed['Comune cui è associata la denominazione precedente']]);
    if (index > -1) {
      comuni[index]['Denominazione precedente'] = comuneRenamed['Denominazione precedente'];
    }
  });

  comuniOld.forEach((comuneOld) => {
    comuni.push({
      'Codice Provincia (1)': comuneOld['Codice Provincia'],
      'Codice Comune formato alfanumerico': comuneOld['Codice Istat del Comune'],
      'Denominazione in italiano': comuneOld['Denominazione'],
      'Sigla automobilistica': comuneOld['Sigla Automobilistica della Provincia'],
    });
  });

  console.log(comuni);

  cb();
}

function fixEncoding(files, finalCb) {
  async.each(files, (file, cb) => {
    // Convert encoding stream
    const stream = fs.createReadStream(file[0])
      .pipe(iconv.decodeStream('win1252'))
      .pipe(iconv.encodeStream('utf8'))
      .pipe(fs.createWriteStream(file[1]));
    
    let error; 
    stream.on('error', function (err) {
      error = true;
      cb(err);
    });
    
    stream.on('close', function () {
      if (!error) {
        cb();
      }
    });
  }, (err) => {
    if (err) {
      return finalCb(err);
    }
    finalCb();
  });
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
