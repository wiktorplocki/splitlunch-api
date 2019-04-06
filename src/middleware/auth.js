const jwt = require('jsonwebtoken');

/**
 * Auth Middleware module.
 * @module middleware/auth
 */
/**
 * Check for, validate and emit JSON Web Tokens in request headers.
 * @param {object} req The request object.
 * @param {object} res The response object.
 * @param {function} next Next function call.
 */
module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};
