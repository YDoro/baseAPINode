const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');


const { host, port, user, pass } = require('../mail/mail.json');

var transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass, }
});

const handlebarOptions = {
    viewEngine: {
      extName: '.html',
      partialsDir: '/mail/auth/',
      layoutsDir: './App/resources/mail/auth/',
      defaultLayout: '',
    },
    viewPath:  path.resolve('./App/resources/mail/auth/'),
    extName: '.html',
  };
transport.use('compile', hbs(handlebarOptions));
module.exports = transport;