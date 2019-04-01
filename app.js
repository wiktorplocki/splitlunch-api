const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

mongoose
  .connect(
    `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}${
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
