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

  dataDirectory: __dirname+'/.data',

  mailgunUrl: '<mailgun url>',
  mailgunFrom: '<mailgun sandbox url>',
  mailgunKey: '<mailgun key>',

  stripeUrl: '<stripe URL>',
  stripeKey: '<stripe key>',
};
