const loginByIdLoader = require ('./entities/login/dataloaders/loginById');
const userByIdLoader = require ('./entities/user/dataloaders/userById');
const userByEmailLoader = require ('./entities/user/dataloaders/userByEmail');

function createDataLoaders (context) {
  const loginById = loginByIdLoader (context);
  const userById = userByIdLoader (context);
  const userByEmail = userByEmailLoader (context);

  return {
    loginById,
    userById,
    userByEmail,
  };
}

module.exports = createDataLoaders;
