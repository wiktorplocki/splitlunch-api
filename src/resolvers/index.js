const Auth = require('./auth');
const Order = require('./order');
const isAuth = require('../middleware/isAuth');

const resolvers = {
  Query: { ...Auth.Query, ...Order.Query },
  Mutation: { ...Auth.Mutation, ...Order.Mutation }
};

const resolverMiddlewares = {
  Query: {
    me: isAuth,
    lastNumOrders: isAuth
  },
  Mutation: {
    createOrder: isAuth,
    createOrderItem: isAuth,
    deleteOrderItem: isAuth
  }
};

module.exports = { resolvers, resolverMiddlewares };
