import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { connect } from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { verify } from 'jsonwebtoken';

import { typeDefs } from './typeDefs';
import resolvers from './resolvers';
import { createTokens } from './helpers/createTokens';
import User from './models/user';

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
    }
    try {
      const data = verify(acccessToken, process.env.ACCESS_TOKEN_SECRET);
      req.userId = data.userId;
      return next();
    } catch {}
    if (!refreshToken) {
      return next();
    }

    let data;

    try {
      data = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      req.userId = data.userId;
    } catch {
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
    req.userId = user.id;
    next();
  });

  server.applyMiddleware({ app, authCookie });
  const dbConnection = await connect(
    process.env.MONGO_URL,
    {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASSWORD,
      useNewUrlParser: true
    }
  );
  if (dbConnection) {
    console.log('Connected to DB, attempting to connect to the server...');
    app.listen({ port: process.env.PORT }, () =>
      console.log(
        `Server launched at http://localhost:${process.env.PORT}${server.graphqlPath}`
      )
    );
  } else {
    throw new Error('Error establishing DB connection!');
  }
};

startServer();
