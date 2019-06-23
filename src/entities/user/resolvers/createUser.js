const catchify = require ('catchify');
const validator = require ('validator');
const uuidv4 = require ('uuid/v4');
const dbUser = require ('../dbModel');
const User = require ('../model');

async function createUserResolver ({ input: { userData } }, context) {
  const { dataLoaders } = context;
  const {
    email, name,
  } = userData;

  if (validator.isEmail (email) === false) {
    return {
      user: null,
      errors: [
        {
          message: 'Your email address does not look right',
        },
      ],
    };
  }

  if (name.trim ().length === 0) {
    return {
      user: null,
      errors: [
        {
          message: 'What do we call you?',
        },
      ],
    };
  }

  if (name.trim () !== name) {
    return {
      user: null,
      errors: [
        {
          message: 'Please remove any empty characters from the start/end of your name',
        },
      ],
    };
  }

  const [userByEmailCheckError, userByEmail] = await catchify (
    dataLoaders.userByEmail.load (email),
  );

  if (userByEmailCheckError) {
    return {
      user: null,
      errors: [
        {
          message: 'Something went wrong',
        },
      ],
    };
  } else if (userByEmail) {
    return {
      user: null,
      errors: [
        {
          message: 'This email is already taken',
        },
      ],
    };
  }

  const [insertUserError, insertedUser] = await catchify (
    dbUser
      .query ()
      .insert ({
        id: uuidv4 (),
        email,
        name,
      })
      .returning ('*'),
  );

  if (insertUserError) {
    return {
      user: null,
      errors: [
        {
          message: 'Something went wrong',
        },
      ],
    };
  }

  const [userByIdError, user] = await catchify (
    User ().byId (context, insertedUser.id),
  );

  if (userByIdError) {
    return {
      user: null,
      errors: [
        {
          message: 'Something went wrong',
        },
      ],
    };
  }

  return {
    user: user.getData (),
    errors: [],
  };
}

module.exports = createUserResolver;
