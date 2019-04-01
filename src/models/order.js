const mongoose = require('mongoose');

/**
 * The Order Item model Schema.
 * @class OrderItem
 * @param {object} participant The User placing the order.
 * @param {string} item The food being ordered.
 * @param {number} price The price of the item ordered.
 * @param {Date} createdAt The date the ordered item was created.
 * @param {Date} updatedAt The date the ordered item was updated.
 */

const OrderItemSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    item: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

/**
 * The Order model Schema.
 * @class Order
 * @param {string} name The name of the order.
 * @param {string} description The description of the order. Used to describe an order in greater detail.
 * @param {Date} createdAt The date the order was placed.
 * @param {Date} updatedAt The date the order was updated.
 * @param {array} participants Users participating in an order.
 * @param {array} details List of ordered items.
 * @param {boolean} finalized Denotes whether or not the order is finalized.
 */

const OrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    details: [OrderItemSchema],
    finalized: { type: Boolean, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
