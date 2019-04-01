const express = require('express');
const mongoose = require('mongoose');

const isAuth = require('./src/middleware/auth');
const headers = require('./src/middleware/headers');

const app = express();

app.use(express.json());
app.use(isAuth);
app.use(headers);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}${
      process.env.MONGO_URL
    }`,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('Connected to DB, attempting to launch the server...');
    app.listen(process.env.PORT, () =>
      console.log(`Server running at port ${process.env.PORT}`)
    );
  })
  .catch(err => {
    throw new Error(err);
  });

module.exports = app;
