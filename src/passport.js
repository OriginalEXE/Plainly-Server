const catchify = require ('catchify');
const uuidv4 = require ('uuid/v4');
const passport = require ('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const loginByIdLoader = require ('./entities/login/dataloaders/loginById');
const userByIdLoader = require ('./entities/user/dataloaders/userById');
const userByEmailLoader = require ('./entities/user/dataloaders/userByEmail');
const dbLogin = require('./entities/login/dbModel');
const dbUser = require('./entities/user/dbModel');

const loginById = loginByIdLoader ();
const userById = userByIdLoader ();
const userByEmail = userByEmailLoader ();

passport.use (
  new TwitterStrategy ({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_AUTH_CALLBACK_URL,
    includeEmail: true,
  }, async (token, tokenSecret, profile, done) => {
    const profileEmail = profile.emails[0].value;

    const [loginByIdError, login] = await catchify (
      loginById.load (profile.id),
    );

    if (loginByIdError) {
      done (loginByIdError);
      return;
    }

    if (login && login.type === 'twitter') {
      const [userByIdError, user] = await catchify (
        userById.load (login.user_id),
      );

      if (userByIdError) {
        done (userByIdError);
        return;
      }

      if (!user) {
        done (null, false);
        return;
      }

      done (null, user);
      return;
    }

    const [userByEmailError, user] = await catchify (
      userByEmail.load (profileEmail),
    );

    if (userByEmailError) {
      done (userByEmailError);
      return;
    }

    if (!user) {
      const [insertUserError, insertedUser] = await catchify (
        dbUser
          .query ()
          .insert ({
            id: uuidv4 (),
            email: profileEmail,
            name: profile.displayName,
          })
          .returning ('*'),
      );

      if (insertUserError) {
        done (insertUserError);
        return;
      }

      const [insertLoginError, insertedLogin] = await catchify (
        dbLogin
          .query ()
          .insert ({
            id: uuidv4 (),
            type: 'twitter',
            user_id: insertedUser.id,
            external_id: profile.id,
          })
          .returning ('*'),
      );

      if (insertLoginError) {
        done (insertLoginError);
        return;
      }

      done (null, insertedUser);
      return;
    }

    const [insertLoginError, insertedLogin] = await catchify (
      dbLogin
        .query ()
        .insert ({
          id: uuidv4 (),
          type: 'twitter',
          user_id: user.id,
          external_id: profile.id,
        })
        .returning ('*'),
    );

    if (insertLoginError) {
      done (insertLoginError);
      return;
    }

    done (null, user);
  }),
);

passport.serializeUser ((user, done) => {
  done (null, user.id);
});

passport.deserializeUser (async (id, done) => {
  console.log ('Unserialize this:', id);
  const [userByIdError, user] = await catchify (userById.load (id));

  if (userByIdError) {
    done (userByIdError);
    return;
  } if (!user) {
    done (null, false);
    return;
  }

  done (null, user);
});

module.exports = passport;
