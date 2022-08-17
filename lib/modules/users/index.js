import _         from 'lodash';
import validator from 'validator';

export default class Users {

  DEMO_USER = {
    uuid: '46907333-EF8B-4A94-B99B-081391802B00',
    company_uuid: 'B6F41348-A3B9-4512-B28E-C964474B8315',
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
