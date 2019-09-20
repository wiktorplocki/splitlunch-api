const User = require('../../models/user');

const Query = {
  me: (_, __, { req }) => {
    if (!req.userId) {
      return null;
    }
    return User.findById(req.userId);
  }
};

module.exports = Query;
