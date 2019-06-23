const catchify = require ('catchify');
const validator = require ('validator');
const User = require ('../model');

async function userByIdResolver ({ id }, context) {
  if (!validator.isUUID (id, 4)) {
    return {
      user: null,
      errors: [
        {
          message: 'Please provide a valid id',
        },
      ],
    };
  }

  const [error, user] = await catchify (User ().byId (context, id));

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

module.exports = userByIdResolver;
