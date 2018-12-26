'use strict';

/**
 * Contains the logic to authenticate the user.
 * @module
 */
const users = {};

// Dependencies
users._db = require('../../../lib/fs-db');
users._auth = require('../../../lib/auth');
users._crypt = require('../../../lib/crypt');
users._validator = require('../../../lib/validator');

/**
 * Logs the user into the system. This requires the user email and password, and
 * it will return a token that can be used in the future requests.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the request's response.
 */
users.login = async function(req) {
  const params = req.parsedUrl.query;

  // Validates the user email and password.
  const email = users._validator.validate(params.email, 'required|minChar:1') && params.email;
  const password = users._validator.validate(params.password, 'required|minChar:1') && params.password;

  // If either parameter is missing or invalid, return an error response.
  if (!email || !password) {
    return { statusCode: 400, data: 'Missing email/password fields.' };
  }

  // Try to get the user data. If it doesn't exist then return.
  let userData;
  try {
    userData = await users._db.read('users', email);
  } catch(e) {
    return { statusCode: 400, data: 'Unknown email/password combination.' };
  }

  // Grab the hashed password.
  const hashedPassword = users._crypt.hash(password);

  // If the password doesn't match the user password then return.
  if (userData.hashedPassword !== hashedPassword) {
    return { statusCode: 400, data: 'Unknown email/password combination.' };
  }

  // Generate a new token for the user.
  const token = await users._auth.generateToken(email);

  return { statusCode: 400, data: { token } };
};

/**
 * Logs the user out of the system. This is done by deleting the token that was
 * issued to him.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the request's response.
 */
users.logout = async function(req) {

  // Grab and validate the token.
  const { token } = req.headers;
  const validToken = users._validator.validate(token, 'required|minChar:1') && token;

  if (!validToken) {
    return { statusCode: 400, data: 'Invalid token.' };
  }
  // Attempt to delete the given token.
  try {
    await users._auth.deleteToken(token);
  } catch(e) {
    return { statusCode: 500, data: { message: 'Unable to delete the user token.' } };
  }

  return { statusCode: 200, data: { message: 'Token deleted successfully' } };
};

module.exports = users;
