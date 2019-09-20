const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');
const createTokens = require('./src/helpers/createTokens');
const User = require('./src/models/user');

const startServer = async () => {
  const playgroundSettings = {
    settings: {
      'request.credentials': 'include'
    }
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }),
    playground: process.env.NODE_ENV === 'development' && playgroundSettings
  });
  const app = express();
  app.use(cookieParser());
  app.use(helmet());
  app.use(async (req, res, next) => {
    const acccessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    if (!refreshToken && !acccessToken) {
      return next();
    } else if (!refreshToken) {
      return next();
    } else {
      const data = jwt.verify(acccessToken, process.env.ACCESS_TOKEN_SECRET);
      req.userId = data.userId;
      next();
    }
    // if (!refreshToken && !acccessToken) {
    //   return next();
    // }
    // try {
    //   const data = jwt.verify(acccessToken, process.env.ACCESS_TOKEN_SECRET);
    //   req.userId = data.userId;
    //   return next();
    //   // eslint-disable-next-line no-empty
    // } catch {
    //   console.log('');
    // }
    // if (!refreshToken) {
    //   return next();
    // }

    let data;

    try {
      data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      req.userId = data.userId;
    } catch (error) {
      return next();
    }

    const user = await User.findById(data.userId);
    if (!user || user.count !== data.count) {
      return next();
    }

    const tokens = createTokens(user);
    res
      .cookie('refresh-token', refreshToken)
      .cookie('access-token', tokens.accessToken);
    // eslint-disable-next-line require-atomic-updates
    req.userId = user.id;
    next();
  });

  server.applyMiddleware({ app });
  const dbConnection = await mongoose.connect(process.env.MONGO_URL, {
    auth: {
      user: encodeURIComponent(process.env.MONGO_USER),
      password: encodeURIComponent(process.env.MONGO_PASSWORD)
    },
    useNewUrlParser: true
  });
  if (dbConnection) {
    console.log('Connected to DB, attempting to connect to the server...');
    app.listen({ port: process.env.PORT }, () => {
      console.log(
        `Server launched at http://localhost:${process.env.PORT}${server.graphqlPath}`
      );
    });
  } else {
    throw new Error('Error establishing DB connection!');
  }
};

startServer();
