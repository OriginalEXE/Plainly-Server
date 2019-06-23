const EventEmitter = require ('events');
const createDataLoaders = require ('./dataLoaders');
const createViewer = require ('./viewer');
const ac = require ('./accessControl');

function createContext (request) {
  const context = {
    request,
    events: new EventEmitter ().setMaxListeners (100),
    viewer: createViewer (request),
    ac,
  };

  context.dataLoaders = createDataLoaders (context);
  return context;
}

module.exports = createContext;
