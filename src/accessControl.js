const AccessControl = require ('accesscontrol');

const ac = new AccessControl ();

ac
  // Guest
  .grant ('guest')
  .readAny ('user', ['id', 'name', 'created_at', 'role'])
  // User
  .grant ('user')
  .readOwn ('user')
  .readAny ('user', ['id', 'name', 'created_at', 'role'])
  .updateOwn ('user', ['email', 'name'])
  .createOwn ('login')
  .readOwn ('login')
  // Administrator
  .grant ('administrator')
  .extend ('user')
  .readAny ('user')
  .updateAny ('user')
  .deleteAny ('user')
  .createAny ('login')
  .readAny ('login')
  .updateAny ('login')
  .deleteAny ('login');

module.exports = ac;
