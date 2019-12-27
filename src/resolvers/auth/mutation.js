const { compare, hash } = require('bcrypt');
const {
  UserInputError,
  AuthenticationError
} = require('apollo-server-express');
const {
  createAccessToken,
  createRefreshToken
} = require('../../helpers/createTokens');
const sendRefreshToken = require('../../helpers/sendRefreshToken');
const User = require('../../models/user');

const Mutation = {
  register: async (_parent, { email, password }) => {
    const hashedPassword = await hash(password, 12);
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      throw new AuthenticationError('User already registered with this email!');
    }
    await new User({ email, password: hashedPassword }).save();
    return true;
  },
  login: async (_parent, { email, password }, { res }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Could not find user!');
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw new UserInputError('Invaild password!');
    }

    sendRefreshToken(res, createRefreshToken(user));
    return {
      accessToken: createAccessToken(user),
      user
    };
  },
  logout: async (_parent, _args, { res }) => {
    sendRefreshToken(res, '');
    return true;
  },
  invalidateRefreshTokens: async (_parent, { userId }) => {
    const user = await User.findOneAndUpdate(userId, {
      $inc: { tokenVersion: 1 }
    }).exec();
    if (!user) {
      return false;
    }
    return true;
  }
};

module.exports = Mutation;
