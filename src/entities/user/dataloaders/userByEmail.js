const DataLoader = require ('dataloader');
const dbUser = require ('../dbModel');

function userByEmailLoader ({ events } = {}) {
  const dataLoader = new DataLoader (emails => dbUser
    .query ()
    .whereIn ('email', emails)
    .then (rows => emails.map (email => rows.find (row => row.email === email)))
    .then ((users) => {
      users
        .filter (user => user)
        .forEach (user => events && events.emit ('userLoadedFromDb', user, { by: 'email' }));
      return users;
    }));

  if (typeof events !== 'undefined') {
    events.on ('userLoadedFromDb', (user, { by }) => {
      if (by === 'email') {
        return;
      }

      dataLoader.prime (user.email, user);
    });
  }

  return dataLoader;
}

module.exports = userByEmailLoader;
