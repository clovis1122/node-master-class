'use strict';

/**
 * An object which contains the system configuration.
 * @module
 */
module.exports = {
  isTesting: process.env.NODE_ENV  === 'test',
  httpPort: Number(process.env.http_port) || 3000,
  httpsPort: Number(process.env.https_port) || 3001,
  hashingSecret: 'dsdefwfwefwefee',

  appName: 'Pizza Delivery',
  baseUrl: 'localhost:3000',

  dataDirectory: __dirname+'/.data',
  assetsDirectory: __dirname+'/public',
  templateDirectory: __dirname+'/web/templates',

  mailgunUrl: 'https://api.mailgun.net/v3/<sandbox url>',
  mailgunFrom: 'pizza@test.com',
  mailgunKey: '<mailgun key>',

  stripeUrl: 'https://api.stripe.com/v1',
  stripeKey: '<stripe key>',
};
