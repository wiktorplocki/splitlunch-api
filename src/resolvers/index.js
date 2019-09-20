const Auth = require('./auth');
const Order = require('./order');

const resolvers = {
  Query: { ...Auth.Query, ...Order.Query },
  Mutation: { ...Auth.Mutation, ...Order.Mutation }
};

module.exports = resolvers;
