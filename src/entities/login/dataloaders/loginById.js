const DataLoader = require ('dataloader');
const dbLogin = require ('../dbModel');

function loginByIdLoader ({ events } = {}) {
  const dataLoader = new DataLoader (ids => dbLogin
    .query ()
    .whereIn ('external_id', ids)
    .then (rows => ids.map (id => rows.find (row => row.external_id === id)))
    .then ((logins) => {
      logins
        .filter (login => login)
        .forEach (login => events && events.emit ('loginLoadedFromDb', login, { by: 'id' }));
      return logins;
    }));

  if (typeof events !== 'undefined') {
    events.on ('loginLoadedFromDb', (login, { by }) => {
      if (by === 'id') {
        return;
      }

      dataLoader.prime (login.external_id, login);
    });
  }

  return dataLoader;
}

module.exports = loginByIdLoader;
