import { sign } from 'jsonwebtoken';

const createTokens = user => {
  const refreshToken = sign(
    { userId: user.id, count: user.count },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  const accessToken = sign(
    { userId: user.id, count: user.count },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  return { refreshToken, accessToken };
};

export default createTokens;
