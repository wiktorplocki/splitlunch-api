const mongoose = require('mongoose');

const {
  Types: { ObjectId }
} = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: value =>
        // eslint-disable-next-line no-useless-escape
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          value
        ),
      message: props => `${props.value} is not a valid email address!`
    },
    required: [true, 'Email address required']
  },
  password: { type: String, required: true },
  name: { type: String },
  balance: { type: Number, default: 0 },
  orders: [{ type: ObjectId, ref: 'Order' }],
  tokenVersion: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);
