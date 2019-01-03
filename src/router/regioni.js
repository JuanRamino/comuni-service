const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', function (req, res) {
  const regioni = new Set(db.map((comune) => {
    if (!comune['Soppresso']) {
      return comune['Denominazione regione'];
    }
  }));

  res.send(Array
    .from(regioni)
    .filter(Boolean)
    .sort());
});

module.exports = router;
