import User from '../../models/user';

const Query = {
  me: (_, __, { req }) => {
    if (!req.userId) {
      return null;
    }
    return User.findById(req.userId);
  }
};

export default Query;
