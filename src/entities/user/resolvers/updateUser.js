const catchify = require ('catchify');
const validator = require ('validator');
const dbUser = require ('../dbModel');
const User = require ('../model');

async function updateUserResolver ({ input: { userData } }, context) {
  const { dataLoaders, ac, viewer } = context;

  if (typeof userData.id === 'undefined') {
    return {
      user: null,
      errors: [
        {
          message: 'Please provide a valid id',
        },
      ],
    };
  }

  if (validator.isUUID (userData.id, 4) === false) {
    return {
      user: null,
      errors: [
        {
          message: 'Please provide a valid id',
        },
      ],
    };
  }

  let permission;

  if (userData.id === viewer.user.id) {
    permission = ac.can (viewer.user.role).updateOwn ('user');
  } else {
    permission = ac.can (viewer.user.role).updateAny ('user');
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

  const filteredData = permission.filter (Object.assign ({}, userData));
  const userCanSeeAtLeastSomeData = Object.keys (filteredData).length !== 0;

  if (!userCanSeeAtLeastSomeData) {
    const [userByIdError, user] = await catchify (
      User ().byId (context, userData.id),
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

  const [userToUpdateError, userToUpdate] = await catchify (
    User ().byId (context, userData.id),
  );

  if (userToUpdateError || !userToUpdate) {
    return {
      user: null,
      errors: [
        {
          message: 'Please provide a valid id',
        },
      ],
    };
  }

  const dataToUpdate = {};

  if (
    typeof filteredData.email !== 'undefined'
    && userToUpdate.email !== filteredData.email
  ) {
    if (validator.isEmail (filteredData.email) === false) {
      return {
        user: null,
        errors: [
          {
            message: 'Your email address does not look right',
          },
        ],
      };
    }

    const [userByEmailCheckError, userByEmail] = await catchify (
      dataLoaders.userByEmail.load (filteredData.email),
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

    dataToUpdate.email = filteredData.email;
    dataToUpdate.email_confirmed = false;
  }

  if (
    typeof filteredData.name !== 'undefined'
    && userToUpdate.name !== filteredData.name
  ) {
    if (filteredData.name.trim ().length === 0) {
      return {
        user: null,
        errors: [
          {
            message: 'What do we call you?',
          },
        ],
      };
    }

    if (filteredData.name.trim () !== filteredData.name) {
      return {
        user: null,
        errors: [
          {
            message: 'Please remove any empty characters from the start/end of your name',
          },
        ],
      };
    }

    dataToUpdate.name = filteredData.name;
  }

  const weHaveSomethingToUpdate = Object.keys (dataToUpdate).length !== 0;

  if (!weHaveSomethingToUpdate) {
    const [userByIdError, user] = await catchify (
      User ().byId (context, userData.id),
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

  const [updateUserError, updatedUser] = await catchify (
    dbUser
      .query ()
      .patch (dataToUpdate)
      .where ('id', userData.id)
      .first ()
      .returning ('*'),
  );

  if (updateUserError) {
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
    User ().byId (context, updatedUser.id, {
      fresh: true,
    }),
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

module.exports = updateUserResolver;
