const mailgun = require ('mailgun.js');

const email = mailgun.client ({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

module.exports = email;
