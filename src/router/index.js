module.exports = (app) => {
  app.use('/comuni', require('./comuni'));
  app.use('/regioni', require('./regioni'));
  app.use('/province', require('./province'));

  // last route respond with 404 to unmanaged routes
  app.use((req, res) => {
    res.sendStatus(404);
  });
};