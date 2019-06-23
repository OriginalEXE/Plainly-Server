const catchify = require ('catchify');
const validator = require ('validator');
const dbUser = require ('../dbModel');

async function deleteUserResolver ({ input: { id: searchId } }, context) {
  const { ac, viewer } = context;

  let permission;

  if (userData.id === viewer.user.id) {
    permission = ac.can (viewer.user.role).deleteOwn ('user');
  } else {
    permission = ac.can (viewer.user.role).deleteAny ('user');
  }

  if (!permission.granted) {
    return {
      user: null,
      errors: [
        {
          message: 'You are not allowed to do this',
        },
      ],
    };
  }

  if (validator.isUUID (searchId, 4) === false) {
    return {
      user: null,
      errors: [
        {
          message: 'Please provide a valid id',
        },
      ],
    };
  }

  const [error, deleted] = await catchify (dbUser
    .query ()
    .where ('id', searchId)
    .delete ()
    .returning ('*'));

  if (error) {
    return {
      user: null,
      errors: [
        {
          message: 'Something went wrong',
        },
      ],
    };
  } else if (deleted.length === 0) {
    return {
      user: null,
      errors: [
        {
          message: 'Could not find a user with this id',
        },
      ],
    };
  }

  const {
    id, email, name,
  } = deleted[0];

  return {
    user: {
      id,
      email,
      username,
      name,
      email_confirmed,
    },
    errors: [],
  };
}

module.exports = deleteUserResolver;
