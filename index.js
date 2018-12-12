const fs = require('fs');
var path = require('path');
const request = require('request');
const async = require('async');
const yauzl = require('yauzl');

const elencoComuniUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';
const elencoComuniOldUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-soppressi.zip';
const fileOutPath = 'data';
const fileOutComuni = 'data/comuni.csv';
const fileOutComuniOld = 'data/comuni-old.zip';

async.series([
  function(cb) {
    getElencoComuni(elencoComuniOldUrl, fileOutComuniOld, cb)
  },
  function(cb) {
    unzip(elencoComuniOldUrl, fileOutPath, cb)
  }
], function(err) {
  if (err) {
    return undefined;
  } else {
    console.log('DONE');
  }
});

function getElencoComuni(url, output, cb) {
  request
  .get(url)
  .on('error', function(err) {
    console.log(err);
    cb(err);
  })
  .on('end', function() {
    cb();
  })
  .pipe(fs.createWriteStream(output))
}

function unzip(input, output, cb) {
  yauzl.open(fileOutComuniOld, {lazyEntries: true}, function(err, zipfile) {
    if (err) {
      console.log(err);
      cb(err);
    }
    zipfile.readEntry();
    zipfile.on("entry", function(entry) {
      if (/\/$/.test(entry.fileName)) {
        // Directory file names end with '/'.
        // Note that entires for directories themselves are optional.
        // An entry's fileName implicitly requires its parent directories to exist.
        zipfile.readEntry();
      } else {
        // file entry
        zipfile.openReadStream(entry, function(err, readStream) {
          if (err) {
            console.log(err);
            cb(err);
          }
          readStream.on("end", function() {
            zipfile.readEntry();
          });

          const filePath = `${output}/${path.basename(entry.fileName)}`;
          readStream.pipe(fs.createWriteStream(filePath));
        });
      }
    });
    zipfile.on("close", cb)
  });
}
