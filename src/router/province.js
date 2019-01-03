const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', function (req, res) {
  const province = new Set(db.map((comune) => {
    if (!comune['Soppresso']) {
      return comune['Sigla automobilistica'];
    }
  }));

  res.send(Array
    .from(province)
    .filter(Boolean)
    .sort());
});

module.exports = router;
