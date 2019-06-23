function createViewer (request) {
  const viewer = {};

  if (request.user) {
    viewer.user = request.user;
  } else {
    viewer.user = {
      id: '',
      role: 'guest',
    };
  }

  return viewer;
}

module.exports = createViewer;
