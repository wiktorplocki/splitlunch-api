const mongoose = require('mongoose');

const {
  Types: { ObjectId }
} = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String },
  balance: { type: Number, default: 0 },
  orders: [{ type: ObjectId, ref: 'Order' }],
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);
