import { model, Schema } from 'mongoose';

const {
  Types: { ObjectId }
} = Schema;

const OrderItemSchema = new Schema(
  {
    order: { type: ObjectId, ref: 'Order', required: true },
    participant: { type: ObjectId, ref: 'User', required: true },
    item: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

const OrderSchema = new Schema(
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

export default {
  Order: model('Order', OrderSchema),
  OrderItem: model('OrderItem', OrderItemSchema)
};
