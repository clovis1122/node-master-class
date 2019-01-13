'use strict';

/**
 * Contains the logic to encrypt/decrypt passwords and other credentials.
 * @module
 */
const crypt = {};

// Dependencies
crypt._crypto = require('crypto');
crypt._config = require('../../config');

/**
 * Given a string, encrypts it using sha256.
 * @param {string} str the string to encrypt.
 * @return {string|boolean} the encrypted string, or false if it cannot be encrypted.
 */
crypt.hash = function(str) {
  if (typeof(str) == 'string' && str.length > 0){
    var hash = crypt._crypto.createHmac('sha256', crypt._config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

/**
 * Generates a random, secure string.
 * @param {number} [bytes=10] the amount of bytes to use.
 * @return {string}
 */
crypt.randomString = function(bytes = 10) {
  return crypt._crypto.randomBytes(bytes).toString('hex');
}

module.exports = crypt;
