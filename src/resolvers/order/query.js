import { Order } from '../../models/order';
import { transformOrder } from '../../helpers/resolverTransforms';

const Query = {
  orders: async () => {
    try {
      const orders = await Order.find();
      return orders.map(order => transformOrder(order));
    } catch (error) {
      throw new Error(error);
    }
  },
  order: async args => {
    try {
      const foundOrder = await Order.findById(args.id);
      return transformOrder(foundOrder);
    } catch (error) {
      throw new Error(error);
    }
  }
};

export default Query;
