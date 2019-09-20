const orderModels = require('../../models/order');
const transformOrder = require('../../helpers/resolverTransforms');

const Query = {
  orders: async () => {
    try {
      const orders = await orderModels.Order.find();
      return orders.map(order => transformOrder(order));
    } catch (error) {
      throw new Error(error);
    }
  },
  order: async args => {
    try {
      const foundOrder = await orderModels.Order.findById(args.id);
      return transformOrder(foundOrder);
    } catch (error) {
      throw new Error(error);
    }
  }
};

module.exports = Query;
