/**
 * Resolver object containing functions for the Auth schema.
 * @module resolvers/auth
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { transformUser } = require('./merge');

module.exports = {
  /**
   * Get all the users.
   * @return {Array<object>} The array of user objects with fields as defined in the query.
   */
  users: async () => {
    try {
      const users = await User.find();
      return users.map(user => transformUser(user));
    } catch (err) {
      throw new Error(err);
    }
  },
  /**
   * Get a specific user
   * @param {object} args The object containing the various arguments.
   * @property {ObjectID | string} id A string representation of a MongoDB ObjectID for the user.
   * @return {object} The User object.
   */
  user: async args => {
    try {
      const foundUser = await User.findById(args.id);
      if (!foundUser) {
        throw new Error('User not found!');
      }
      return transformUser(foundUser);
    } catch (err) {
      throw new Error(err);
    }
  },
  /**
   * Create a new user
   * @param {object} args The object containing the various arguments.
   * @property {object} userInput The input object.
   * @property {string} userInput.email The user's email address.
   * @property {string} userInput.password The user's password.
   * @property {string} userInput.name The user's display name. Optional.
   * @return {object} The new user object.
   */
  createUser: async args => {
    try {
      const foundUser = await User.findOne({ email: args.userInput.email });
      if (foundUser) {
        throw new Error('User exists already');
      }
      const hashedPwd = await bcrypt.hash(args.userInput.password, 10);
      const user = new User({
        email: args.userInput.email,
        password: hashedPwd
      });
      const result = await user.save();
      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw new Error(err);
    }
  },
  /**
   * Log in to the system.
   * @param {string} email The user's email address.
   * @param {string} password The user's password
   * @return {object} The user's auth data. Includes token, token expiry time, and user id.
   */
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );
    return { userId: user.id, token, tokenExpiry: 24 };
  },
  /**
   * Verify a JWT token,
   * @param {string} token The token to verify.
   * @returns {string | boolean} The validated token
   */
  verifyToken: async ({ token }) => {
    try {
      const isValid = await jwt.verify(token, process.env.JWT_SECRET);
      if (!isValid) {
        throw new Error('Token not found!');
      }
      if (Math.floor(Date.now() / 1000) > isValid.exp) {
        throw new jwt.TokenExpiredError(
          `Token expired at ${new Date(
            isValid.exp * 1000
          ).toLocaleDateString()}`,
          new Date(isValid.exp * 1000)
        );
      }
      return isValid;
    } catch (err) {
      throw new Error(err);
    }
  }
};
