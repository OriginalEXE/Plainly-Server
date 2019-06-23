const session = require ('express-session');
const KnexSessionStore = require ('connect-session-knex') (session);
const knex = require ('./db/knex');

const store = new KnexSessionStore ({
  knex,
});

module.exports = session ({
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  },
  store,
  saveUninitialized: false,
  resave: false,
});
