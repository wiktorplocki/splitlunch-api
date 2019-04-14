const { Order, OrderItem } = require('../models/order');
const User = require('../models/user');
const { transformOrder, transformOrderItem } = require('./merge');

module.exports = {
  orderItems: async args => {
    try {
      const order = await Order.findById(args.id);
      if (!order) {
        throw new Error('Order not found!');
      }
      return order.details;
    } catch (err) {
      throw new Error(err);
    }
  },
  createOrderItem: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthorized!');
    }
    try {
      const order = await Order.findById(args.orderItemInput.orderId);
      if (!order) {
        throw new Error('Order not found!');
      }
      const user = await User.findById(req.userId); // req.userId
      if (!user) {
        throw new Error('User not found!');
      }
      const orderItem = new OrderItem({
        item: args.orderItemInput.item,
        price: +args.orderItemInput.price,
        participant: req.userId,
        order: transformOrder(order)
      });
      const orderItemResult = await orderItem.save();
      await order.details.push(orderItemResult);
      await order.updateOne({
        sumTotal: Number.parseFloat(
          (order.sumTotal += orderItemResult.price)
        ).toFixed(2)
      });
      await order.save();
      return transformOrderItem(orderItemResult);
    } catch (err) {
      throw new Error(err);
    }
  },
  deleteOrderItem: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthorized!');
    }
    try {
      const orderItem = await OrderItem.findById(args.id);
      if (!orderItem) {
        throw new Error('Order item not found!');
      }
      const order = await Order.findById(orderItem.order);
      if (!order) {
        throw new Error('Order not found!');
      }
      const participant = await User.findById(orderItem.participant);
      if (!participant) {
        throw new Error('Participating user not found!');
      }
      if (!participant.equals(req.userId)) {
        throw new Error('You are not the creator of this order item!');
      } else {
        const orderResult = await order.details.pull(orderItem);
        const result = await orderItem.remove();
        if (orderResult && result) {
          return result;
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  }
};
