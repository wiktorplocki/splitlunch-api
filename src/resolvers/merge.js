/**
 * Transformation functions for data entities.
 * @module resolvers/merge
 */

const DataLoader = require('dataloader');
const User = require('../models/user');
const { Order, OrderItem } = require('../models/order');
const { dateToString } = require('../helpers/date');

const orderLoader = new DataLoader(orderIds => orders(orderIds));
const userLoader = new DataLoader(userIds =>
  User.find({ _id: { $in: userIds } })
);

/**
 * Finds and transforms all Order entities with given orderIds parameters.
 * @param {*} orderIds An array of MongoDB ObjectID elements.
 * @returns Transformed Order entities.
 */
const orders = async orderIds => {
  try {
    const orders = await Order.find({ _id: { $in: orderIds } });
    return orders.map(order => transformOrder(order));
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Finds and transforms a single Order entity with the given orderId.
 * @param {*} orderId A single MongoDB ObjectID element.
 * @returns Transformed Order entity.
 */
const order = async orderId => {
  try {
    const foundOrder = await orderLoader.load(orderId.toString());
    return {
      ...foundOrder._doc,
      _id: foundOrder.id,
      date: dateToString(foundOrder._doc.date),
      participants: () => userLoader.loadMany(foundOrder._doc.participants)
    };
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Finds and transforms User entities with given orderIds parameter.
 * @param {*} userIds An array of MongoDB ObjectID elements.
 * @returns Transformed User entities.
 */
const users = async userIds => {
  try {
    const users = await User.find({ _id: { $in: userIds } });
    return users.map(user => transformUser(user));
  } catch (err) {
    new Error(err);
  }
};

/**
 * Finds and transforms a single User entity with the given orderId.
 * @param {*} userId A single MongoDB ObjectID element.
 * @returns Tranformed User entity.
 */
const user = async userId => {
  try {
    const foundUser = await userLoader.load(userId.toString());
    return {
      ...foundUser._doc,
      _id: foundUser.id,
      password: null,
      orders: () => orderLoader.loadMany(foundUser._doc.orders)
    };
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Finds and transforms OrderItem entities with given orderItemIds parameter.
 * @param {*} orderItemIds An array of MongoDB ObjectID elements.
 * @returns Transformed OrderItem entities.
 */
const orderItems = async orderItemIds => {
  try {
    const orderItems = await OrderItem.find({ _id: { $in: orderItemIds } });
    return orderItems.map(orderItem => transformOrderItem(orderItem));
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Takes an Order object and transforms it by applying tranformation functions.
 * @param {*} order The Order object to transform.
 * @returns Transformed Object with unwinded and parsed parameters for increased accessibility.
 */
const transformOrder = order => {
  return {
    ...order._doc,
    _id: order.id,
    creator: user.bind(this, order.creator),
    date: dateToString(order._doc.date),
    participants: users.bind(this, order.participants),
    details: orderItems.bind(this, order.details),
    createdAt: dateToString(order._doc.createdAt),
    updatedAt: dateToString(order._doc.updatedAt)
  };
};

/**
 * Takes an OrderItem object and transforms it by applying transformation functions.
 * @param {*} orderItem The OrderItem object to transform.
 * @returns Transformed Object with unwinded and parsed parameters for increased accessibility.
 */
const transformOrderItem = orderItem => {
  return {
    ...orderItem._doc,
    _id: orderItem.id,
    order: order.bind(this, orderItem.order),
    participant: user.bind(this, orderItem.participant),
    createdAt: dateToString(orderItem._doc.createdAt),
    updatedAt: dateToString(orderItem._doc.updatedAt)
  };
};

/**
 * Takes a User object and transforms it by applying transformation functions.
 * @param {*} user The User object to transform.
 * @returns Transformed Object with unwinded and parsed param
 */
const transformUser = user => {
  return {
    ...user._doc,
    _id: user.id,
    name: user._doc.name,
    password: null,
    orders: orders.bind(this, user.orders)
  };
};

module.exports = { transformOrder, transformOrderItem, transformUser };
