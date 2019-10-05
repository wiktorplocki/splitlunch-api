const sendRefreshToken = (res, token) => {
  return res.cookie('jid', token, {
    httpOnly: true,
    path: '/refresh_token'
  });
};

module.exports = sendRefreshToken;
