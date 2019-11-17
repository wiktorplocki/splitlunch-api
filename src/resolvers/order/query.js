const orderModels = require('../../models/order');
const transformOrder = require('../../helpers/resolverTransforms');

const Query = {
  orders: () => orderModels.Order.find().map(transformOrder),
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
