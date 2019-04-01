const mongoose = require('mongoose');

/**
 * The Order Item model Schema.
 * @param participant The User placing the order.
 * @param item The food being ordered.
 * @param price The price of the item ordered.
 */

const OrderItemSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: { type: String, required: true },
  price: { type: Number, required: true }
});

/**
 * The Order model Schema.
 * @param name The name of the order.
 * @param description The description of the order. Used to describe an order in greater detail.
 * @param date The date the order was placed.
 * @param participants Users participating in an order.
 * @param details List of ordered items.
 * @param finalized Denotes whether or not the order is finalized.
 */

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  details: [OrderItemSchema],
  finalized: { type: Boolean, required: true }
});

module.exports = mongoose.model('Order', OrderSchema);
