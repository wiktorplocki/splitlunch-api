const { compare, hash } = require('bcrypt');
const {
  createAccessToken,
  createRefreshToken
} = require('../../helpers/createTokens');
const sendRefreshToken = require('../../helpers/sendRefreshToken');
const User = require('../../models/user');

const Mutation = {
  register: async (_, { email, password }) => {
    const hashedPassword = await hash(password, 12);
    try {
      const foundUser = await User.findOne({ email });
      if (foundUser) {
        console.log('User already registered with this email!');
        throw new Error('User already registered with this email!');
      }
      await new User({ email, password: hashedPassword }).save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  login: async (_, { email, password }, { res }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Could not find user!');
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error('Invaild password!');
    }

    sendRefreshToken(res, createRefreshToken(user));
    return {
      accessToken: createAccessToken(user),
      user
    };
  },
  logout: async (_, __, { res }) => {
    sendRefreshToken(res, '');
    return true;
  },
  invalidateRefreshTokens: async (_, { userId }) => {
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
