const express = require('express');
const _ = require('lodash');
const db = require('../db');

const router = express.Router();

router.get('/', function (req, res) {
  res.send(db);
});

router.get('/:comune', function (req, res) {
  const name = req.params.comune;
  console.log(name);

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
