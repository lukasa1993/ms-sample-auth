import _         from 'lodash';
import fetch     from 'node-fetch';
import qs        from 'qs';
import validator from 'validator';

export default class Users {

  constructor() {
    this.endpoint = 'http://ms_sample_user:7702/internal';
  }

  async authenticate(email) {
    email = _.toLower(email);
    if (validator.isEmail(email) === false) {
      throw new Error('not an email');
    }

    const res = await fetch(`${this.endpoint}/auth`, {
      headers: { 'Content-Type': 'application/json' },
      method:  'post',
      body:    JSON.stringify({ email }),
    });

    return res.json();
  }

  async byCode(code) {
    const res = await fetch(`${this.endpoint}/find?${qs.stringify({ code })}`);

    return res.json();
  }

  async resetCode(user_uuid) {
    const res = await fetch(`${this.endpoint}/reset_code`, {
      headers: { 'Content-Type': 'application/json' },
      method:  'post',
      body:    JSON.stringify({ user_uuid }),
    });

    return res.json();
  }

}
