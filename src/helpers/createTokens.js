const jsonwebtoken = require('jsonwebtoken');

const createTokens = user => {
  const refreshToken = jsonwebtoken.sign(
    { userId: user.id, count: user.count },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  const accessToken = jsonwebtoken.sign(
    { userId: user.id, count: user.count },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  return { refreshToken, accessToken };
};

module.exports = createTokens;
