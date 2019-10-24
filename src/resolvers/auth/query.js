const User = require('../../models/user');
const { verify } = require('jsonwebtoken');

const Query = {
  me: (_, __, { req }) => {
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
  bye: (_, __, { payload }) => {
    console.log(payload);
    return `Your user id is: ${payload.userId}`;
  },
  users: () => {
    return User.find();
  }
};

module.exports = Query;
