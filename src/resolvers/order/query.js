const { verify } = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const { Order } = require('../../models/order');
const transformOrder = require('../../helpers/resolverTransforms');

const Query = {
  orders: () => Order.find().map(transformOrder),
  order: async (_parent, { id }) => {
    try {
      const foundOrder = await Order.findById(id);
      return transformOrder(foundOrder);
    } catch (error) {
      throw new Error(error);
    }
  },
  lastNumOrders: async (_parent, { count, userId }, { req }) => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new AuthenticationError('Unauthorized!');
    }

    try {
      const token = authorization.split(' ')[1];
      const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);
      const foundOrders = await Order.find({
        creator: userId || payload.userId
      })
        .sort('-createdAt')
        .limit(count)
        .exec();
      return foundOrders;
    } catch (error) {
      throw new Error(error);
    }
  }
};

module.exports = Query;
