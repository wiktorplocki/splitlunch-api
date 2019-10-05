const { verify } = require('jsonwebtoken');

const isAuth = async (resolve, parent, args, context, info) => {
  const authorization = context.req.headers['authorization'];
  if (!authorization) {
    throw new Error('Not Authenticated!');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);
    context.payload = payload;
    return await resolve(parent, args, context, info);
  } catch (error) {
    console.log(error);
    throw new Error('Not authenticated!');
  }
};

module.exports = isAuth;
