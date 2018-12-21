
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const request = require('request');
const async = require('async');
const yauzl = require('yauzl');
const parse = require('csv-parse/lib/sync');
const _ = require('lodash');
const iconv = require('iconv-lite');

const { COMUNI_JSON_FILE } = process.env;
const dataPath = `${__dirname}/../data`;

const elencoComuniUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';
const fileOutComuni = `${dataPath}/tmp/comuni.csv`;
const fileComuni = `${dataPath}/comuni.csv`;

const elencoComuniOldUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-soppressi.zip';
const fileOutComuniOldCsv = `${dataPath}/tmp/comuni-old.csv`;
const fileOutComuniOld = `${dataPath}/tmp/comuni-old.zip`;
const fileComuniOld = `${dataPath}/comuni-old.csv`;

const elencoComuniRenameddUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-denominazioni-precedenti.zip';
const fileOutComuniRenamed = `${dataPath}/tmp/comuni-renamed.zip`;
const fileOutComuniRenamedCsv = `${dataPath}/tmp/comuni-renamed.csv`;
const fileComuniRenamed = `${dataPath}/comuni-renamed.csv`;

const jsonFile = `${dataPath}/${COMUNI_JSON_FILE}`;

const csvToJson = (mappedFiles, jsonOut) => (cb) => {
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

  fs.writeFileSync(jsonOut, JSON.stringify(comuni));

  cb();
};

const fixEncoding = (files) => (finalCb) => {
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
};

const checkFiles = (files) => (cb) => {
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
};

const getElencoComuni = (url, output) => (cb) => {
  request
    .get(url)
    .on('error', (err) => {
      cb(err);
    })
    .on('end', () => {
      cb();
    })
    .pipe(fs.createWriteStream(output));
};

const unzip = (input, output) => (cb) => {
  yauzl.open(input, {lazyEntries: true}, (err, zipfile) => {
    if (err) {
      return cb(err);
    }
    zipfile.readEntry();
    zipfile.on('entry', (entry) => {
      if (/\/$/.test(entry.fileName)) {
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
};

// RUNNER
async.series([
  getElencoComuni(elencoComuniUrl, fileOutComuni),
  getElencoComuni(elencoComuniOldUrl, fileOutComuniOld),
  unzip(fileOutComuniOld, fileOutComuniOldCsv),
  getElencoComuni(elencoComuniRenameddUrl, fileOutComuniRenamed),
  unzip(fileOutComuniRenamed, fileOutComuniRenamedCsv),
  checkFiles([
    fileOutComuni,
    fileOutComuniOldCsv,
    fileOutComuniRenamedCsv]),
  fixEncoding([
    [fileOutComuni, fileComuni],
    [fileOutComuniOldCsv, fileComuniOld],
    [fileOutComuniRenamedCsv, fileComuniRenamed]]),
  csvToJson({
    comuni: fileComuni,
    comuniOld: fileComuniOld,
    comuniRenamed: fileComuniRenamed,
  }, jsonFile),
], (err) => console.log(err || 'DONE'));