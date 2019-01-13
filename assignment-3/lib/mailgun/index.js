'use strict';

/**
 * Contains the logic to interact with the mailgun API.
 * @module
 */
const mailgun = {};

// Dependencies
mailgun._request = require('../request');
mailgun._config = require('../../config');

/**
 * Sends a message using Mailgun.
 * @param {string} to the email to send the message to.
 * @param {string} subject the subject of the message.
 * @param {string} text the text of the message.
 * @return {Promise<void>}
 */
mailgun.sendMessage = async function(to, subject, text)  {
  const { mailgunUrl: url, mailgunFrom: from } = mailgun._config;
  const data = { to, from, subject, text };
  const options = {
    data,
    method: 'POST',
    auth: `api:${mailgun._config.mailgunKey}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  try {
    await mailgun._request.makeRequestAsync(url+'/messages', null, options);
  } catch(e) {
    throw new Error('There was an error connecting to mailgun to send the message.');
  }
};

module.exports = mailgun;
