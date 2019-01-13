'use strict';

/**
 * Contains the logic to display and manage an user's carts.
 * @module
 */
const shoppingCart = {};

// Dependencies
shoppingCart._db = require('../../../lib/fs-db');
shoppingCart._auth = require('../../../lib/auth');
shoppingCart._validator = require('../../../lib/validator');

/**
 * Get the shopping cart of the authenticated user.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the request's response.
 */
shoppingCart.get = async function(req) {

  // Grab the token from the headers.
  const { token } = req.headers;

  // Validate that the token is valid.
  const validToken = shoppingCart._validator.validate(token, 'required|minChar:1') && token;

  if (!validToken) {
    return { statusCode: 400, data: { Error: 'Invalid token.' } };
  }

  // Get the user email by it's token, and if it is not valid then return an error.

  const tokenObject = await shoppingCart._auth.getByToken(token);

  if (!tokenObject || !tokenObject.id) {
    return { statusCode: 400, data: { Error: 'Invalid token - it might have expired.' } };
  }

  const email = tokenObject.id;

  // Attempt to read the user cart. If he doesn't have a cart yet then return an empty
  // list.
  try {
    const userCart = await shoppingCart._db.read('shopping-carts', email);
    return { statusCode: 200, data: userCart };
  } catch(e) {
    return { statusCode: 200, data: [] };
  }
};

/**
 * Add a new item to the user's shopping cart. Requires a parameter "itemId".
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the request's response.
 */
shoppingCart.add = async function(req) {

  //  Validate both the token and the item ID.
  const { token } = req.headers;
  const { itemId }  = req.parsedUrl.query;
  const validToken = shoppingCart._validator.validate(token, 'required|minChar:1') && token;
  const validItemId = shoppingCart._validator.validate(itemId, 'required|integer') && itemId;

  if (!validToken) {
    return { statusCode: 400, data: 'Invalid token.' };
  }

  if (!validItemId) {
    return { statusCode: 400, data: 'Invalid item ID.' };
  }

  // Get the user email from the token.

  const tokenObject = await shoppingCart._auth.getByToken(token);

  if (!tokenObject || !tokenObject.id) {
    return { statusCode: 400, data: 'Invalid token - it might have expired.' };
  }

  const email = tokenObject.id;

  // Get the user cart. If there's no cart then create one.
  let userCart;

  try {
    userCart = await shoppingCart._db.read('shopping-carts', email);
  } catch(e) {
    try {
      await shoppingCart._db.create('shopping-carts', email, []);
    } catch(e) {
      return { statusCode: 500, data: 'Unable to retrieve or create the user shopping cart' };
    }
    userCart = [];
  }

  // Push the item to add into the user's current cart list.
  userCart.push(itemId);

  // Attempt to save the user cart.
  try {
    await shoppingCart._db.update('shopping-carts', email, userCart);
    return { statusCode: 204, data: 'Item added to the cart.' };
  } catch(e) {
    return { statusCode: 500, data: 'Unable to save the item.' };
  }
}

/**
 * Removes an item from the user cart.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the request's response.
 */
shoppingCart.delete = async  function(req) {

  // Validates both the token and the item ID.
  const { token } = req.headers;
  const { itemId }  = req.parsedUrl.query;
  const validToken = shoppingCart._validator.validate(token, 'required|minChar:1') && token;
  const validItemId = shoppingCart._validator.validate(itemId, 'required|integer') && itemId;

  if (!validToken) {
    return { statusCode: 400, data: 'Invalid token.' };
  }

  if (!validItemId) {
    return { statusCode: 400, data: 'Invalid item ID.' };
  }

  // Grab the user email from the token.

  const tokenObject = await shoppingCart._auth.getByToken(token);

  if (!tokenObject || !tokenObject.id) {
    return { statusCode: 400, data: 'Invalid token - it might have expired.' };
  }

  const email = tokenObject.id;

  // Attempt to get the user cart -- if there's no cart, then return an error.

  let userCart;

  try {
    userCart = await shoppingCart._db.read('shopping-carts', email);
  } catch(e) {
    return { statusCode: 400, data: 'Unable to delete items from this user shopping cart.' };
  }

  // Remove the item from the cart (just once!).

  for (const index in userCart) {
    if (userCart[index] === validItemId)  {
      userCart.splice(index, 1);
      break;
    }
  }
  
  // If there are no more items, delete the cart. Otherwise update it.
  if (userCart.length === 0)  {
    try {
      await shoppingCart._db.delete('shopping-carts', email);
    } catch(e) {
      return { statusCode: 500, data: 'Unable to delete this shopping cart.' };
    }
  } else {
    try {
      await shoppingCart._db.update('shopping-carts', email, userCart);
    } catch(e) {
      return { statusCode: 500, data: 'Unable to delete this shopping cart.' };
    }
  }

  return { statusCode: 204, data: 'Item deleted successfully.' };
}

module.exports = shoppingCart;
