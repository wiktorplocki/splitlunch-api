const express = require('express');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const schema = require('./src/schemas');
const rootValue = require('./src/resolvers');

const isAuth = require('./src/middleware/auth');
const headers = require('./src/middleware/headers');
const helmet = require('helmet');

const app = express();
app.use(express.json());
app.use(isAuth);
app.use(headers);
app.use(helmet());
app.use(
  '/',
  graphqlHttp({
    schema,
    rootValue,
    graphiql: process.env.NODE_ENV === 'development'
    // context: req => {
    //   ({ user: req.user, isAuth: req.isAuth });
    // }
  })
);

try {
  const success = mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}${process.env.MONGO_URL}`,
    { useNewUrlParser: true }
  );
  if (success) {
    console.log('Connected to DB, attempting to launch the server...');
    app.listen(process.env.PORT, () =>
      console.log(`Server running at port ${process.env.PORT}`)
    );
  }
} catch (error) {
  throw new Error(error);
}

module.exports = app;
