const catchify = require ('catchify');

function Login () {
  let context = {};
  let data = {};
  let dataLoaderKey = 'loginById';
  let dataLoaderParam = null;

  function filterData (login) {
    if (typeof login !== 'object') {
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

    if (login.user_id === viewer.user.id) {
      permission = ac.can (viewer.user.role).readOwn ('login');
    } else {
      permission = ac.can (viewer.user.role).readAny ('login');
    }

    if (!permission.granted) {
      return null;
    }

    return permission.filter (login);
  }

  function setData (login) {
    data = login;
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

    const [error, login] = await catchify (dataLoaders[dataLoaderKey].load (dataLoaderParam));

    if (error) {
      return null;
    }

    setData (filterData (login));
    return getData ();
  }

  async function byId (newContext, id, options = {}) {
    context = newContext;
    dataLoaderKey = 'loginById';
    dataLoaderParam = id;
    await fetchData (options);

    return {
      getData,
      setData,
    };
  }

  return {
    byId,
  };
}

module.exports = Login;
