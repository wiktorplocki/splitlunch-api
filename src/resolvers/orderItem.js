const { Order, OrderItem } = require('../models/order');
const User = require('../models/user');
const { transformOrder } = require('./merge');

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
      const user = await User.findById('5ca3a955b953381ccc9718a5'); // req.userId
      if (!user) {
        throw new Error('User not found!');
      }
      const orderItem = new OrderItem({
        item: args.orderItemInput.item,
        price: +args.orderItemInput.price,
        participant: '5ca3a955b953381ccc9718a5',
        order: transformOrder(order)
      });
      const orderItemResult = await orderItem.save();
      order.details.push(orderItemResult);
      order.sumTotal.set(order.sumTotal + orderItem.price);
      await order.save();
      return orderItemResult();
    } catch (err) {
      throw new Error(err);
    }
  },
  createOrderWithOrderItem: async (args, req) => {
    // if (!req.isAuth) {
    //   throw new Error('Unauthorized!');
    // }
    try {
      const user = await User.findById('5ca3a955b953381ccc9718a5'); // req.userId
      if (!user) {
        throw new Error('User not found!');
      }
      const order = new Order({
        name: args.orderInput.name,
        description: args.orderInput.description,
        sumTotal: 0,
        date: new Date(args.orderInput.date),
        details: [],
        participants: ['5ca3a955b953381ccc9718a5'],
        creator: '5ca3a955b953381ccc9718a5'
      });
      args.orderInput.details.map(async item => {
        const orderItem = new OrderItem({
          ...item,
          order, // transformOrder
          participant: order.creator // transformUser
        });
        await order.details.push(orderItem);
      });
      await order.details.forEach(item =>
        Number.parseFloat((order.sumTotal += item.price).toFixed(2))
      );
      await order.save();
      return transformOrder(order);
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
