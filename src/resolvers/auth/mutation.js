import bcrypt from 'bcrypt';
import { createTokens } from '../../helpers/createTokens';
import User from '../../models/user';

const Mutation = {
  register: async (_, { email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ email, password: hashedPassword });
    return true;
  },
  login: async (_, { email, password }, { res }) => {
    const user = await User.findOne({ email });
    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return null;
    }

    const { accessToken, refreshToken } = createTokens(user);

    res
      .cookie('access-token', accessToken, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      })
      .cookie('refresh-token', refreshToken, {
        expires: new Date(Date.now() + 1000 * 60 * 15)
      });
    return user;
  },
  invalidateTokens: async (_, __, { req }) => {
    if (!req.userId) return null;
    const user = await User.findOneAndUpdate(req.userId, {
      $inc: { count: 1 }
    }).exec();
    if (!user) {
      return false;
    }
    return true;
  }
};

export default Mutation;
