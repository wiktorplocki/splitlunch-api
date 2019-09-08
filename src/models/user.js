import { model, Schema } from 'mongoose';

const {
  Types: { ObjectId }
} = Schema;

const UserSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String },
  balance: { type: Number, default: 0 },
  orders: [{ type: ObjectId, ref: 'Order' }],
  count: { type: Number, default: 0 }
});

export default model('User', UserSchema);
