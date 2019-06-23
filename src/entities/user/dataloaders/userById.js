const DataLoader = require ('dataloader');
const dbUser = require ('../dbModel');

function userByIdLoader ({ events } = {}) {
  const dataLoader = new DataLoader (ids => dbUser
    .query ()
    .whereIn ('id', ids)
    .then (rows => ids.map (id => rows.find (row => row.id === id)))
    .then ((users) => {
      users
        .filter (user => user)
        .forEach (user => events && events.emit ('userLoadedFromDb', user, { by: 'id' }));
      return users;
    }));

  if (typeof events !== 'undefined') {
    events.on ('userLoadedFromDb', (user, { by }) => {
      if (by === 'id') {
        return;
      }

      dataLoader.prime (user.id, user);
    });
  }

  return dataLoader;
}

module.exports = userByIdLoader;
