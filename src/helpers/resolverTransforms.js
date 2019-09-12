import DataLoader from 'dataloader';
import User from '../models/user';
import { Order } from '../models/order';
import dateToString from '../helpers/dateToString';

const orderLoader = new DataLoader(orderIds => orders(orderIds));
const userLoader = new DataLoader(userIds =>
  User.find({ _id: { $in: userIds } })
);

const orders = async orderIds => {
  try {
    const orders = await Order.find({ _id: { $in: orderIds } });
    return orders.map(order => transformOrder(order));
  } catch (error) {
    throw new Error(error);
  }
};

const users = async userIds => {
  try {
    const users = await User.find({ _id: { $in: userIds } });
    return users.map(user => transformUser(user));
  } catch (error) {
    throw new Error(error);
  }
};

const user = async userId => {
  try {
    const foundUser = await userLoader.load(userId.toString());
    return {
      ...foundUser._doc,
      _id: foundUser.id,
      password: null,
      orders: () => orderLoader.loadMany(foundUser._doc.orders)
    };
  } catch (error) {
    throw new Error(error);
  }
};

const transformOrder = order => {
  return {
    ...order._doc,
    _id: order.id,
    creator: user.bind(this, order.creator),
    date: dateToString(order._doc.date),
    participants: users.bind(this, order.participants),
    createdAt: dateToString(order._doc.createdAt),
    updatedAt: dateToString(order._doc.updatedAt)
  };
};

const transformUser = user => {
  return {
    ...user._doc,
    _id: user.id,
    name: user._doc.name,
    password: null,
    orders: orders.bind(this, user.orders)
  };
};

export { transformOrder, transformUser };
