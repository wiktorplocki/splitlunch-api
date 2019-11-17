const sendRefreshToken = (res, token) => {
  return res.cookie('jid', token, {
    httpOnly: true,
    path: '/refresh_token',
    expires: new Date(Date.now() + 7 * 86400 * 1000)
  });
};

module.exports = sendRefreshToken;
