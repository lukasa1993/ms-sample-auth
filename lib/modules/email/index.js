import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class Email {
  async sendAuth(to, url, code) {
    const msg = {
      to,
      from:    process.env.SENDGRID_FROM,
      subject: 'Sample Authentication Email',
      text:    `visit following ${url} to authenticate \n code: ${code}`,
      html:    `Click <a href="${url}">here</a> to authenticate <br> Code: ${code}`,
    };

    return sgMail.send(msg);
  }

}
