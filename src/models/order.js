const mongoose = require('mongoose');

const {
  Types: { ObjectId }
} = mongoose.Schema;

const OrderItemSchema = new mongoose.Schema(
  {
    order: { type: ObjectId, ref: 'Order', required: true },
    participant: { type: ObjectId, ref: 'User', required: true },
    item: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

const OrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    participants: [{ type: ObjectId, ref: 'User' }],
    details: [OrderItemSchema],
    finalized: { type: Boolean, default: false },
    sumTotal: { type: Number, default: 0 },
    creator: { type: ObjectId, ref: 'User' },
    archived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  Order: mongoose.model('Order', OrderSchema),
  OrderItem: mongoose.model('OrderItem', OrderItemSchema)
};
