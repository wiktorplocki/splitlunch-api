const mongoose = require('mongoose');

/**
 * The User model Schema.
 * @class User
 * @param {string} email: The user's email address.
 * @param {string} password: The user's password.
 * @param {string} name: The username, can also be a display name for the frontend app.
 * @param {number} debt: The user's total debt across all orders they participated in.
 * @param {array} orders: [ WORK IN PROGRESS ] All orders that this user participated in.
 */
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String },
  debt: { type: Number }
  // orders: {  }
});

module.exports = mongoose.model('User', UserSchema);
