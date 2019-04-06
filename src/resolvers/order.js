const { Order } = require('../models/order');
const User = require('../models/user');
const { transformOrder } = require('./merge');

module.exports = {
  orders: async () => {
    try {
      const orders = await Order.find();
      return orders.map(order => transformOrder(order));
    } catch (err) {
      throw new Error(err);
    }
  },
  order: async args => {
    try {
      const foundOrder = await Order.findById(args.id);
      return transformOrder(foundOrder);
    } catch (err) {
      throw new Error(err);
    }
  },
  createOrder: async (args, req) => {
    // if (!req.isAuth) {
    //   throw new Error('Unauthorized!');
    // }
    const order = new Order({
      name: args.orderInput.name,
      description: args.orderInput.description,
      date: new Date(args.orderInput.date),
      details: [],
      participants: ['5ca3a955b953381ccc9718a5'], // req.userId
      creator: '5ca3a955b953381ccc9718a5'
    });
    let createdOrder;
    try {
      const result = await order.save();
      createdOrder = transformOrder(result);
      const foundUser = await User.findById('5ca3a955b953381ccc9718a5');
      if (!foundUser) {
        throw new Error('User not found!');
      }
      foundUser.orders.push(order);
      await foundUser.save();
      return createdOrder;
    } catch (err) {
      throw new Error(err);
    }
  },
  createOrderWithoutDetails: async (args, req) => {
    // if (!req.isAuth) {
    //   throw new Error('Unauthorized!');
    // }
    const order = new Order({
      name: args.orderInput.name,
      description: args.orderInput.description,
      date: new Date(args.orderInput.date),
      details: [],
      participants: ['5ca3a955b953381ccc9718a5'], // req.userId
      creator: '5ca3a955b953381ccc9718a5'
    });
    try {
      const result = await order.save();
      return transformOrder(result);
    } catch (err) {
      throw new Error(err);
    }
  },
  joinOrder: async (args, req) => {
    // if (!req.isAuth) {
    //   throw new Error('Unauthorized!');
    // }
    try {
      const foundUser = await User.findById('5ca3a955b953381ccc9718a5'); // req.userId
      if (!foundUser) {
        throw new Error('User not found!');
      }
      const foundOrder = await Order.findById(args.orderInput.id);
      if (!foundOrder) {
        throw new Error('Order not found!');
      }
      foundOrder.participants.push(foundUser);
      await foundOrder.save();
      foundUser.orders.push(foundOrder);
      await foundUser.save();
      return transformOrder(foundOrder);
    } catch (err) {
      throw new Error(err);
    }
  },
  leaveOrder: async (args, req) => {
    // if (!req.isAuth) {
    //   throw new Error('Unauthorized!');
    // }
    try {
      const foundOrder = await Order.findById(args.orderId); // orderInput.id
      if (!foundOrder) {
        throw new Error('Order not found!');
      }
      const foundUser = await User.findById('5ca3a955b953381ccc9718a5'); // req.id
      if (!foundUser) {
        throw new Error('User not found!');
      }
      if (foundOrder.creator.equals(foundUser.id)) {
        throw new Error(
          'Creator cannot leave the order, try cancelling the order instead.'
        );
      }
      await foundOrder.participants.pull(foundUser);
      await foundUser.orders.pull(foundOrder);
      return transformOrder(foundOrder);
    } catch (err) {
      throw new Error(err);
    }
  },
  cancelOrder: async (args, req) => {
    // if (!req.isAuth) {
    //   throw new Error('Unauthorized!');
    // }
    try {
      const foundOrder = await Order.findById(args.orderId);
      if (!foundOrder) {
        throw new Error('Order not found!');
      }
      const foundUser = await User.findById('5ca3a955b953381ccc9718a5'); // req.userId
      if (!foundUser) {
        throw new Error('User not found!');
      }
      if (!foundOrder.creator.equals(foundUser.id)) {
        throw new Error('Only the order creator can cancel this order1');
      }
      await foundOrder.archived.set(true);
    } catch (err) {
      throw new Error(err);
    }
  },
  finalizeOrder: async (args, req) => {
    // if (!req.isAuth) {
    //   throw new Error('Unauthorized!');
    // }
    try {
      const foundOrder = await Order.findById(args.orderId);
      if (!foundOrder) {
        throw new Error('Order not found!');
      }
      for (const item of foundOrder.details) {
        const foundParticipant = await User.findById(item.participant);
        if (!foundParticipant) {
          throw new Error('User not found!');
        }
        if (foundParticipant.equals(foundOrder.creator)) {
          await foundParticipant.updateOne({
            balance: Number.parseFloat(
              (foundParticipant.balance += item.price).toFixed(2)
            )
          });
        } else {
          await foundParticipant.updateOne({
            balance: Number.parseFloat(
              (foundParticipant.balance += item.price).toFixed(2)
            )
          });
        }
      }
      await foundOrder.updateOne({ finalized: true });
      const result = await foundOrder.save();
      return transformOrder(result);
    } catch (err) {
      throw new Error(err);
    }
  }
};
