const catchify = require ('catchify');
const validator = require ('validator');
const User = require ('../model');

async function userByEmailResolver ({ email }, context) {
  if (!validator.isEmail (email)) {
    return {
      user: null,
      errors: [
        {
          message: 'Please enter a valid email address',
        },
      ],
    };
  }

  const [error, user] = await catchify (User ().byEmail (context, email));

  if (error) {
    return {
      user: null,
      errors: [
        {
          message: 'Something went wrong, please try again',
        },
      ],
    };
  }

  return {
    user: user.getData (),
    errors: [],
  };
}

module.exports = userByEmailResolver;
