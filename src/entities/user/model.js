const catchify = require ('catchify');

function User () {
  let context = {};
  let data = {};
  let dataLoaderKey = 'userById';
  let dataLoaderParam = null;

  function filterData (user) {
    if (typeof user !== 'object') {
      return null;
    }

    if (typeof context.ac === 'undefined') {
      return null;
    }

    if (typeof context.viewer === 'undefined') {
      return null;
    }

    const { ac, viewer } = context;
    let permission;

    if (user.id === viewer.user.id) {
      permission = ac.can (viewer.user.role).readOwn ('user');
    } else {
      permission = ac.can (viewer.user.role).readAny ('user');
    }

    if (!permission.granted) {
      return null;
    }

    return permission.filter (user);
  }

  function setData (user) {
    data = user;
  }

  function getData () {
    return data;
  }

  async function fetchData ({ fresh = false }) {
    if (typeof context.dataLoaders === 'undefined') {
      return null;
    }

    const { dataLoaders } = context;

    if (typeof dataLoaders[dataLoaderKey] === 'undefined') {
      return null;
    }

    if (fresh) {
      dataLoaders[dataLoaderKey].clear (dataLoaderParam)
    }

    const [error, user] = await catchify (dataLoaders[dataLoaderKey].load (dataLoaderParam));

    if (error) {
      return null;
    }

    setData (filterData (user));
    return getData ();
  }

  async function byId (newContext, id, options = {}) {
    context = newContext;
    dataLoaderKey = 'userById';
    dataLoaderParam = id;
    await fetchData (options);

    return {
      getData,
      setData,
    };
  }

  async function byEmail (newContext, email, options = {}) {
    context = newContext;
    dataLoaderKey = 'userByEmail';
    dataLoaderParam = email;
    await fetchData (options);

    return {
      getData,
      setData,
    };
  }

  return {
    byId,
    byEmail,
  };
}

module.exports = User;
