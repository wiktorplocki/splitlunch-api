const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { connect } = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const { verify } = require('jsonwebtoken');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');
const addMiddlewareToResolver = require('./src/helpers/addMiddlewareToResolver');
const isAuth = require('./src/middleware/isAuth');

const User = require('./src/models/user');
const {
  createAccessToken,
  createRefreshToken
} = require('./src/helpers/createTokens');
const sendRefreshToken = require('./src/helpers/sendRefreshToken');

(async () => {
  const app = express();
  app.use(helmet());
  app.use(cors({ credentials: true }));
  app.use(cookieParser(process.env.JWT_SECRET));
  app.get('/', (req, res) => res.send('Hello!'));
  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: '' });
    }

    let payload = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      console.log(error);
      return res.send({ ok: false, accessToken: '' });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.send({ ok: false, accessToken: '' });
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: '' });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  const dbConnection = await connect(
    process.env.MONGO_URL,
    {
      auth: {
        user: encodeURIComponent(process.env.MONGO_USER),
        password: encodeURIComponent(process.env.MONGO_PASSWORD)
      },
      useNewUrlParser: true
    }
  );
  if (dbConnection) {
    console.log('DB connection successful!');
    const resolverGuards = {
      Query: {
        bye: isAuth,
        me: isAuth
      },
      Mutation: {
        createOrder: isAuth,
        createOrderItem: isAuth,
        deleteOrderItem: isAuth
      }
    };
    const schema = applyMiddleware(
      makeExecutableSchema({ typeDefs, resolvers }),
      resolverGuards
    );
    const playgroundSettings = {
      settings: {
        'request.credentials': 'include'
      }
    };
    const apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }) => ({ req, res }),
      playground: process.env.NODE_ENV === 'development' && playgroundSettings
    });
    apolloServer.applyMiddleware({ app, cors: true });

    app.listen({ port: process.env.PORT }, () =>
      console.log(
        `Express server listening on port ${process.env.PORT}, path ${apolloServer.graphqlPath}`
      )
    );
  } else {
    throw new Error('Error connecting to DB, aborting process!');
  }
})();
