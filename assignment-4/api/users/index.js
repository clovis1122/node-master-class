'use strict';

/**
 * Contains the logic to handle and manage users.
 * @module
 */
const users = {};

// Dependencies
users._db = require('../../lib/fs-db');
users._auth = require('../../lib/auth');
users._crypt = require('../../lib/crypt');
users._validator = require('../../lib/validator');

/**
 * Given an email returns the information about that user.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the user data.
 */
users.get = async function(req) {
  const params = req.parsedUrl.query;
  const email = users._validator.validate(params.email, 'required|minChar:1') && params.email;

  if (!email) {
    return { statusCode: 400, data: 'Missing email' };
  }

  const data = await users._db.read('users', email);
  delete data.hashedPassword;

  return { statusCode: 200, data };
}

/**
 * Given user data, creates a new user.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the new user data.
 */
users.create = async function(req) {
  const params = req.payload;

  // TOS agreement must be true
  if (!params.tosAgreement) {
    return { statusCode: 400, data: { Error: 'You must accept the TOS.' } };
  }

  // Validates the required fields.
  const name = users._validator.validate(params.name, 'required|minChar:1') && params.name;
  const email = users._validator.validate(params.email, 'required|minChar:1') && params.email;
  const address = users._validator.validate(params.address, 'required|minChar:1') && params.address;
  const password = users._validator.validate(params.password, 'required|minChar:1') && params.password;

  // If any of the field is missing, then return an error.
  if (!name || !email || !address || !password) {
    return { statusCode: 400, data: { Error: 'Missing required fields.' } };
  }

  // Hash the given password.
  const hashedPassword = users._crypt.hash(password);
  if (!hashedPassword) {
    return { statusCode: 500, data: 'Could not hash the user\'s password.' };
  }

  const data = { name, email, address, hashedPassword };

  // Create the user in the DB.
  await users._db.create('users', email, data);

  // Delete the hashedPassword property as to not return it to the user.=
  delete data.hashedPassword;

  return { statusCode: 200, data };
}

/**
 * Given user data, creates a new user.
 * @param {import('http').IncomingMessage} req the server request object.
 * @notes the email is always required, and at least one of the optional fields
 * must be sent.
 * @return {Promise<{ statusCode: number, data: any}>} the updated user data.
 */
users.update = async function(req) {
  const params = req.parsedUrl.query;

  // Validate the user params.
  const name = users._validator.validate(params.name, 'required|minChar:1') && params.name;
  const email = users._validator.validate(params.email, 'required|minChar:1') && params.email;
  const address = users._validator.validate(params.address, 'required|minChar:1') && params.address;
  const password = users._validator.validate(params.password, 'required|minChar:1') && params.password;

  // The user's email must be present, otherwise return an error.
  if (!email) {
    return { statusCode: 400, data: { Error: 'Missing required fields.' } };
  }

  // If there isn't at least one parameter valid for the edit, then return an error.
  const hasOneEditParam = name || address || password;

  if (!hasOneEditParam) {
    return { statusCode: 400, data: { Error: 'Missing field to update.' } };
  }

  // Try to grab the user data.
  let userData;

  try {
    userData = await await users._db.read('users', email);
  } catch(e) {
    return { statusCode: 400, data: { Error: 'Could not find the user to update.' } };
  }

  if (name) userData.name  = name;
  if (address) userData.address  = address;
  if (password) userData.hashedPassword  = users._crypt.hash(password);

  // Update the user in the DB.
  await users._db.update('users', email, userData);

  // Delete the hashed password property to not return it.
  delete userData.hashedPassword;

  return { statusCode: 200, data: userData };
}

/**
 * Given the email, deletes the user.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>}
 */
users.delete = async function(req) {
  const params = req.parsedUrl.query;

  // Validate the email.
  const email = users._validator.validate(params.email, 'required|minChar:1') && params.email;

  if (!email) {
    return { statusCode: 400, data: { Error: 'Missing the email.' } };
  }

  try {
    await users._db.delete('users', email);
    return { statusCode: 204, data: { message: 'User deleted successfully.' }};
  } catch(e) {
    return { statusCode: 500, data: { Error: 'Could not delete the user.' } };
  }
};

/**
 * Searches for an user given the email.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the user that matches the given email.
 */
users.getUser = async function(req) {
  const params = req.parsedUrl.query;
  const email = users._validator.validate(params.email, 'required|minChar:1') && params.email;

  if (!email) {
    return { statusCode: 400, data: { Error: 'Invalid email.' } };
  }

  try {
    const userData = await users._db.read('users', email);
    return { statusCode: 200, data: userData };
  } catch(e) {
    return { statusCode: 400, data: { Error: 'Could not find the user to retrieve.' } };
  }
}

module.exports = users;
