const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Ramkumar gurav <${process.env.EMAIL_FROM}>`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  //method that returns different transports for different environments
  newTransport() {
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //sends the actual email
    //step1)Render HTML based on the pug template for email
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      //passing some data to pug template
      firstName: this.firstName,
      url: this.url,
      subject: subject,
    });

    //step2)Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.convert(html), //extracting text(withour html) from welcome pug template
    };

    // step3)Create a transport and send Email
    await this.newTransport().sendMail(mailOptions);
  }

  //sendWelcome method that sends the welcome email to user
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!'); //await is used bcz send() method is asynchrounous method
  }

  //sendResetPassword method that sends the resetpassword email to user
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password Reset token(valid for only 10minutes)'
    );
  }
};
