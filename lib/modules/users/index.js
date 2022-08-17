import _         from 'lodash';
import validator from 'validator';

export default class Users {

  DEMO_USER = {
    email: 'demo@example.com',
    code:  '1234567890',
  };

  async authenticate(email) {
    email = _.toLower(email);
    if (validator.isEmail(email) === false) {
      throw new Error('not an email');
    }
    if (email === 'demo@example.com') {
      return this.DEMO_USER;
    }

    throw new Error('User Not Found');
  }

  async byCode(code) {
    let user = null;

    if (code === '1234567890') {
      user = this.DEMO_USER;
    }

    if (!user) {
      throw new Error('not found');
    }

    return user;
  }

  async resetCode(user_uuid) {
    return true;
  }

}
