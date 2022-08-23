import Promise from 'bluebird';
import https   from 'https';
import _       from 'lodash';
import fetch   from 'node-fetch';

export default class Auth {

  constructor() {
    this.kong_api       = process.env.KONG_ENDPOINT;
    this.kong_admin_api = process.env.KONG_ADMIN;
  }

  async authConsumer(user_id, company_id) {
    let consumerAppRes = await fetch(`${this.kong_admin_api}/consumers/${user_id}/oauth2`);
    const consumerApp  = await consumerAppRes.json();

    if (consumerApp.hasOwnProperty('data') && _.isEmpty(consumerApp.data) === false) {
      return _.first(consumerApp.data);
    }

    const res = await fetch(`${this.kong_admin_api}/consumers/${user_id}`, {
      method:  'PUT',
      body:    JSON.stringify({ custom_id: `${user_id}_${company_id}`, tags: [company_id] }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status > 299) {
      throw new Error(await res.text());
    }

    consumerAppRes = await fetch(`${this.kong_admin_api}/consumers/${user_id}/oauth2`, {
      method:  'POST',
      body:    JSON.stringify({
        name:          'ms-sample-oauth2',
        redirect_uris: [`https://${process.env.SELF_FRONT}`],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (consumerAppRes?.status > 299) {
      throw new Error(await consumerAppRes.text());
    }

    return await consumerAppRes.json();
  }

  async logoutAll(user_id, token = null) {
    const res    = await fetch(`${this.kong_admin_api}/oauth2_tokens?authenticated_userid=${user_id}`);
    const tokens = await res.json();

    return Promise.map(tokens.data, _token => {
      if (_token.authenticated_userid === user_id) {
        if (token !== null && token !== _token.access_token) {
          return null;
        }
        return fetch(`${this.kong_admin_api}/oauth2_tokens/${_token.id}`, { method: 'DELETE' });
      }
      return null;
    }, { concurrency: 1 });
  }

  async authUser(user_id, company_id, type = 'user') {
    const consumerAuth = await this.authConsumer(user_id, company_id);

    const body = {
      grant_type:    'client_credentials',
      scope:         type,
      client_id:     consumerAuth.client_id,
      client_secret: consumerAuth.client_secret,
    };

    const payload       = {
      method:  'POST',
      body:    JSON.stringify(body),
      agent:   new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Content-Type': 'application/json',
        'Host':         process.env.SELF_API,
      },
    };

    // TODO: ------------------------------ ↓↓↓↓ this must be one of protected paths
    const kong_endpoint = `${this.kong_api}/user/oauth2/token`;
    const res           = await fetch(kong_endpoint, payload);
    const result        = await res.json();
    if (res.status > 299) {
      console.log({ result, kong_endpoint, payload });
      throw new Error('failed');
    }

    return { ...result, scope: type };
  }
}
