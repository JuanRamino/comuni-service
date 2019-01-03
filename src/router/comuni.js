const express = require('express');
const _ = require('lodash');
const db = require('../db');

const router = express.Router();

router.get('/', function (req, res) {
  const {regione, provincia} = req.query;
  let comuni = db;
  
  if (provincia) {
    comuni = comuni.filter((c) => c['Sigla automobilistica'] &&
      c['Sigla automobilistica'].toLowerCase() === provincia.toLowerCase());
  } else if (regione) {
    comuni = comuni.filter((c) => c['Denominazione regione'] &&
      c['Denominazione regione'].toLowerCase() === regione.toLowerCase()
    );
  }

  res.send(comuni);
});

router.get('/:comune', function (req, res) {
  const name = req.params.comune;

  let index = _.findIndex(db, (c) =>
    c['Denominazione in italiano'].toLowerCase() === name.toLowerCase());

  if (index < 0) {
    index = _.findIndex(db, (c) => {
      if (c['Denominazione precedente']) {
        return c['Denominazione precedente'].toLowerCase() === name.toLowerCase();
      }
    });
  }

  if (index < 0) {
    return res.sendStatus(404);
  }

  return res.send(db[index]);
});

module.exports = router;
