const {
  AuthenticationError,
  UserInputError
} = require('apollo-server-express');
const { verify } = require('jsonwebtoken');
const orderModels = require('../../models/order');
const User = require('../../models/user');
const { transformOrder } = require('../../helpers/resolverTransforms');

const Mutation = {
  createOrder: async (
    _parent,
    { OrderInput: { name, date, description, details = [] } },
    { req }
  ) => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new AuthenticationError('No authorization header!');
    }

    try {
      const token = authorization.split(' ')[1];
      const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!payload) {
        throw new AuthenticationError('Token invalid!');
      }

      const order = await new orderModels.Order({
        name,
        description,
        date: new Date(date),
        details,
        participants: [payload.userId],
        creator: payload.userId
      });

      const foundUser = await User.findById(payload.userId);
      if (!foundUser) {
        throw new Error('User not found!');
      }

      if (details.length > 0) {
        details.map(async ({ item, price }) => {
          const orderItem = await new orderModels.OrderItem({
            orderId: order.id,
            participant: foundUser.id,
            item,
            price
          }).save();
          order.details.push(orderItem);
        });
      }

      foundUser.orders.push(order);
      await foundUser.save();
      return transformOrder(order);
    } catch (error) {
      console.log(error);
      return null;
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
