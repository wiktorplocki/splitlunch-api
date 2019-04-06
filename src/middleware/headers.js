/**
 * Header middleware module.
 * @module middleware/headers
 */
/**
 * Add CORS headers to every server response, then proceed to handle next event.
 * @param {object} req The request object.
 * @param {object} res The response object.
 * @param {function} next Next function call.
 */
module.exports = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};
