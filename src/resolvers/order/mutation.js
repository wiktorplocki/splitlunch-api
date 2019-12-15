const {
  AuthenticationError,
  UserInputError
} = require('apollo-server-express');
const orderModels = require('../../models/order');
const User = require('../../models/user');
const transformOrder = require('../../helpers/resolverTransforms');

const Mutation = {
  createOrder: async (
    { orderInput: { name, date, description } },
    { isAuth, userId }
  ) => {
    if (!isAuth) {
      throw new Error('Unauthorized!');
    }
    const order = new orderModels.Order({
      name,
      description,
      date: new Date(date),
      details: [],
      participants: [userId],
      creator: userId
    });
    let createdOrder;
    try {
      const result = await order.save();
      createdOrder = transformOrder(result);
      const foundUser = await User.findById(userId);
      if (!foundUser) {
        throw new Error('User not found!');
      }
      foundUser.orders.push(order);
      await foundUser.save();
      return createdOrder;
    } catch (error) {
      throw new Error(error);
    }
  },
  createOrderWithoutDetails: async (
    { orderInput: { name, date, description } },
    { isAuth, userId }
  ) => {
    if (!isAuth) {
      throw new AuthenticationError('Unauthorized!');
    }
    const order = new orderModels.Order({
      name,
      description,
      date: new Date(date),
      details: [],
      participants: [userId],
      creator: userId
    });
    try {
      const result = await order.save();
      return transformOrder(result);
    } catch (error) {
      throw new UserInputError(error);
    }
  },
  joinOrder: async ({ orderInput: { id } }, { isAuth, userId }) => {
    if (!isAuth) {
      throw new AuthenticationError('Unauthorized!');
    }
    try {
      const foundUser = await User.findById(userId);
      if (!foundUser) {
        throw new Error('User not found!');
      }
      const foundOrder = await orderModels.Order.findById(id);
      if (!foundOrder) {
        throw new Error('Order not found!');
      }
      foundOrder.participants.push(foundUser);
      await foundOrder.save();
      foundUser.push(foundOrder);
      await foundUser.save();
      return transformOrder(foundOrder);
    } catch (error) {
      throw new Error(error);
    }
  },
  leaveOrder: async ({ orderId }, { isAuth, userId }) => {
    if (!isAuth) {
      throw new AuthenticationError('Unauthorized!');
    }
    try {
      const foundOrder = await orderModels.Order.findById(orderId);
      if (!foundOrder) {
        throw new Error('Order not found!');
      }
      const foundUser = await User.findById(userId);
      if (!foundUser) {
        throw new Error('User not found!');
      }
      if (foundOrder.creator.equals(foundUser.id)) {
        throw new Error(
          'Creator cannot leave the order, try cancelling the order first'
        );
      }
      await foundOrder.participants.pull(foundUser);
      await foundUser.orders.pull(foundOrder);
      return transformOrder(foundOrder);
    } catch (error) {
      throw new Error(error);
    }
  },
  // cancelOrder: async ({ orderId }, { isAuth, userId }) => {
  //   if (!isAuth) {
  //     throw new Error('Unauthorized!');
  //   }
  //   try {
  //     const foundOrder = await orderModels.Order.findById(orderId);
  //     if (!foundOrder) {
  //       throw new Error('Order not found!');
  //     }
  //     const foundUser = await User.findById(userId);
  //     if (!foundUser) {
  //       throw new Error('User not found!');
  //     }
  //     if (!foundOrder.creator.equals(foundUser.id)) {
  //       throw new Error('Only the order creator can cancel this order!');
  //     }
  //     await foundOrder.archived.set(true);
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // },
  finalizeOrder: async ({ orderId }) => {
    try {
      const foundOrder = await orderModels.Order.findById(orderId);
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
            balance: parseFloat(
              (foundParticipant.balance += item.price).toFixed(2)
            )
          });
        }
      }
      await foundOrder.updateOne({ finalized: true });
      const result = await foundOrder.save();
      return transformOrder(result);
    } catch (error) {
      throw new Error(error);
    }
  }
};

module.exports = Mutation;
