'use strict';

/**
 * Contains the logic to display and manage the menu of items.
 * @module
 */
const menu = {};

// Dependencies
menu._db = require('../../lib/fs-db');

/**
 * Returns a list of the menu items.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the request's response.
 */
menu.get = async function() {
  // Attempt to grab the menu items.
  let menuItems = [];
  try {
    menuItems = await menu._db.read('menu', 'menu');
  } catch(e) {
    return { statusCode: 500, data: "Unable to read the menu file." };
  }

  return { statusCode: 200, data: menuItems.items};
}

module.exports = menu;
