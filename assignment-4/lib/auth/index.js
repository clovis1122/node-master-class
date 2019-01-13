'use strict';

/**
 * Module responsible of managing the authentication of the system.
 * @module
 */
const auth = {};

// Dependencies
auth._crypt = require('../crypt');
auth._db = require('../fs-db');

/**
 * Given a token, returns the data associated with it. The token must exist
 * and it must not be expired for the data to be returned.
 * @param {string} token the user token.
 * @return {Promise<{}>} the data associated with this token.
 */
auth.getByToken = async function(token) {
  try {
    const tokenData = await auth._db.read('auth', token);
    return tokenData.expires > Date.now() ? tokenData : null;
  } catch(e) {
    return null;
  }
}

/**
 * Given a token, returns the data associated with it. The token must exist
 * and it must not be expired for the data to be returned.
 * @param {string} token the user token.
 * @return {Promise<[]>} the data associated with this token.
 */
auth.getRecentTokens = async function() {
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);

  try {
    const tokens = await auth._db.listDir('auth');
    const recentTokens = [];
    for (const token of tokens) {
      const tokenData = await auth._db.read('auth', token);

      if (tokenData.createdAt > twentyFourHoursAgo) {
        recentTokens.push(tokenData);
      }
    }

    return recentTokens;
  } catch(e) {
    return null;
  }
}

/**
 * Given an ID (usually an user email) and an expiration date, generates a new token.
 * @param {string} id the ID to issue the token to.
 * @param {number} [expires] the ID to issue the token to.
 * @return {Promise<string>} the newly created token.
 */
auth.generateToken = async function(id, expires = Date.now() + 1000 * 60 * 60) {
  const token = auth._crypt.randomString(10);
  const data = { token, id, expires, createdAt: Date.now() };
  await auth._db.create('auth', token, data);
  return token;
}

/**
 * Given a token, deletes it and the data associated with it.
 * @param {string} token the token to delete.
 * @return {Promise<void>}
 */
auth.deleteToken = function(token) {
  return auth._db.delete('auth', token);
}

module.exports = auth;
