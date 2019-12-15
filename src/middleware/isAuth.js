const { verify } = require('jsonwebtoken');

const isAuth = async (resolve, parent, args, context, info) => {
  const authorization = context.req.headers['authorization'];
  if (!authorization) {
    return;
  } else {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);
    context.payload = payload;
    return await resolve(parent, args, context, info);
  }
};

module.exports = isAuth;
