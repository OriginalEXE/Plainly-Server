require ('dotenv').config ();

const express = require ('express');
const graphqlHTTP = require ('express-graphql');
const bodyParser = require ('body-parser');
const cookieParser = require ('cookie-parser');

require ('./db/init');

const schema = require ('./schema/schema');
const createContext = require ('./context');
const passport = require ('./passport');
const session = require ('./session');

const userByIdResolver = require ('./entities/user/resolvers/userById');
const userByEmailResolver = require ('./entities/user/resolvers/userByEmail');
const createUserResolver = require ('./entities/user/resolvers/createUser');
const updateUserResolver = require ('./entities/user/resolvers/updateUser');
const deleteUserResolver = require ('./entities/user/resolvers/deleteUser');

const app = express ();
const root = {
  userById: userByIdResolver,
  userByEmail: userByEmailResolver,
  createUser: createUserResolver,
  updateUser: updateUserResolver,
  deleteUser: deleteUserResolver,
};

app.use (cookieParser ());
app.use (bodyParser.urlencoded ({ extended: true }));
app.use (bodyParser.json ());
app.use (session);
app.use (passport.initialize ());
app.use (passport.session ());
app.use (
  '/graphql',
  graphqlHTTP (request => ({
    schema,
    rootValue: root,
    graphiql: true,
    context: createContext (request),
  })),
);
app.get ('/auth/twitter', passport.authenticate ('twitter'));
app.get ('/auth/twitter/callback', passport.authenticate ('twitter', {
  successRedirect: '/',
  failureRedirect: '/enter',
}));
app.get ('/', (req, res) => {
  res.json ({
    user: req.user,
  });
});
app.get ('/exit', (req, res) => {
  req.logout ();
  res.json ({
    success: true,
    message: 'You have logged out successfully!',
  });
});
app.use ((error, req, res, next) => {
  console.log (error);
  next ();
});

app.listen (4000);
