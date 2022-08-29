import fetch from 'node-fetch';

export default class Email {
  constructor() {
    this.endpoint = 'http://ms_sample_email:7702/internal';
  }

  async sendAuth(to, url, code) {
    const res = await fetch(`${this.endpoint}/auth`, {
      headers: { 'Content-Type': 'application/json' },
      method:  'post',
      body:    JSON.stringify({ to, url, code }),
    });

    return res.text();
  }

}
