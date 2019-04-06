const authResolver = require('./auth');
const orderResolver = require('./order');
const orderItemResolver = require('./orderItem');

const rootResolver = {
  ...authResolver,
  ...orderResolver,
  ...orderItemResolver
};

module.exports = rootResolver;
