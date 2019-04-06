const mongoose = require('mongoose');

/**
 * The Order Item model Schema.
 * @class OrderItem
 * @param {object} order The Order this item belongs to.
 * @param {object} participant The User placing the order.
 * @param {string} item The food being ordered.
 * @param {number} price The price of the item ordered.
 * @param {Date} createdAt The date the ordered item was created.
 * @param {Date} updatedAt The date the ordered item was updated.
 */

const OrderItemSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
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
 * @param {string} name The name of the order. *Required*
 * @param {string} description The description of the order. Used to describe an order in greater detail.
 * @param {Date} date The date of the order, ie. when you will go out eat. *Required*
 * @param {array} participants Users participating in an order.
 * @param {array} details List of ordered items.
 * @param {boolean} finalized Denotes whether or not the order is finalized.
 * @param {number} sumTotal The sum total of the order.
 * @param {object} creator The creator of the order.
 * @param {boolean} archived Whether the order is archived (deleted) or not. If an order is marked as both finalized and archived, it is successfully closed. If it is only archived, it has been deleted.
 * @param {Date} createdAt The date the order was placed.
 * @param {Date} updatedAt The date the order was updated.
 */

const OrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    details: [OrderItemSchema],
    finalized: { type: Boolean, default: false },
    sumTotal: { type: Number, default: 0 },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
      // required: true
    },
    archived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  Order: mongoose.model('Order', OrderSchema),
  OrderItem: mongoose.model('OrderItem', OrderItemSchema)
};
