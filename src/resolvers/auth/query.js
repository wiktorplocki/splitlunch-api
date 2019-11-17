const User = require('../../models/user');
const { transformUser } = require('../../helpers/resolverTransforms');
const { verify } = require('jsonwebtoken');

const Query = {
  me: (_parent, _args, { req }) => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(' ')[1];
      const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);
      return User.findById(payload.userId);
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  hello: () => 'hi!',
  bye: (_parent, _args, { payload }) => {
    console.log(payload);
    return `Your user id is: ${payload.userId}`;
  },
  users: () => User.find(),
  user: async (_parent, { id }) => transformUser(await User.findById(id))
};

module.exports = Query;
