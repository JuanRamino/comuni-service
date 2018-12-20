module.exports = (app) => {
  app.use('/comuni', require('./comuni'));

  // last route respond with 404 to unmanaged routes
  app.use((req, res) => {
    res.sendStatus(404);
  });
};