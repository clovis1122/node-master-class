'use strict';

/**
 * Contains the logic to manage orders.
 * @module
 */
const orders = {};

// Dependencies
orders._stripe = require('../../../lib/stripe');
orders._mailgun = require('../../../lib/mailgun');
orders._db = require('../../../lib/fs-db');
orders._auth = require('../../../lib/auth');
orders._validator = require('../../../lib/validator');

/**
 * Creates an order. During the order creation, the user will be billed using
 * stripe and an email will be sent using mailgun. His shopping cart will
 * be emptied (deleted) since the order was created.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the request's response.
 */
orders.create = async function(req) {
  
  // Grab and validate the token and the credit card.
  const { token } = req.headers;
  const { creditCard } = req.payload;
  const validToken = orders._validator.validate(token, 'required|minChar:1') && token;
  const validCreditCard = orders._validator.validate(creditCard, 'required|minChar:1') && creditCard;

  if (!validToken) {
    return { statusCode: 400, data: { Error: 'Invalid token.' } };
  }

  if (!validCreditCard) {
    return { statusCode: 400, data: { Error: 'Invalid credit card.' } };
  }

  // Attempt to get the user email from the token.

  const tokenObject = await orders._auth.getByToken(token);

  if (!tokenObject || !tokenObject.id) {
    return { statusCode: 400, data: { Error: 'Invalid token - it might have expired.' } };
  }

  const email = tokenObject.id;

  // Attempt to get the user's current cart.

  let userCart;
  try {
    userCart = await orders._db.read('shopping-carts', email);
  } catch(e) {
    return { statusCode: 400, data: { Error: 'Could not obtain the user shopping cart.'} };
  }

  // Attempt to get the user's orders. If they do not exist then create them.
  let userOrders;

  try {
    userOrders = await orders._db.read('orders', email);
  } catch(e) {
    try {
      await orders._db.create('orders', email, []);
    } catch(e) {
      return { statusCode: 500, data: { Error: 'Unable to retrieve or create the user orders.' } };
    }
    userOrders = [];
  }

  // Attempt to get the menu items and create a mapping between the ID and the item.
  let menuItems = {};

  try {
    menuItems = await orders._db.read('menu', 'menu');
    menuItems = menuItems.items.reduce(function(menu, item) {
      menu[item.id] = item;
      return menu;
    }, {});
  } catch(e) { 
    return { statusCode: 500, data: { Error: 'Unable to read the menu of items.' } };
  }

  // Creates the new user order and adds it to the user orders.
  const userOrder = { items: userCart.map(itemId => menuItems[itemId]), createdAt: Date.now() };
  const total = userOrder.items.reduce((total, item) => total += item);
  userOrders.push(userOrder);

  // Attempt to process the payment.
  try {
    userOrder.stripeId = await orders._stripe.chargeUser(validCreditCard, total);
  } catch(e) {
    console.error(e);
    return { statusCode: 500, data: { Error: 'Unable to process the payment.' } };
  }

  // Attempt to send the email.
  try {
    await orders._mailgun.sendMessage(
      email,
      'Order created successfully!',
      `Dear ${email},
      Your order has been completed. The stripe ID is: ${userOrder.stripeId}.`
    );
  } catch(e) {
    return { statusCode: 500, data: 'Unable to complete the order email.' };
  }

  // Attempt to save the order and delete the user cart.
  try {
    await orders._db.update('orders', email, userOrders);
    await orders._db.delete('shopping-carts', email);
  } catch(e) {
    return { statusCode: 500, data: { Error: 'Unable to complete the user order creation.' } };
  }

  return { statusCode: 200, data: 'Order placed successfully.' };
}

/**
 * Returns the current authenticated user orders.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the request's response.
 */
orders.get = async function(req) {

  // Grab and validate the token.
  const { token } = req.headers;
  const validToken = orders._validator.validate(token, 'required|minChar:1') && token;

  if (!validToken) {
    return { statusCode: 400, data: 'Invalid token.' };
  }

  // Grab the user email from the token.
  const tokenObject = await orders._auth.getByToken(token);

  if (!tokenObject || !tokenObject.id) {
    return { statusCode: 400, data: 'Invalid token - it might have expired.' };
  }

  const email = tokenObject.id;

  // Grab the user orders.
  let userOrders = [];

  try {
    userOrders = await orders._db.read('orders', email);
  } catch(e) {
    return { statusCode: 400, data: 'Unable to retrieve the user orders.' };
  }
  return { statusCode: 200, data: userOrders };
}

/**
 * Fetches the recent orders made in 24 hours or less.
 * @return {Promise<{ statusCode: number, data: any}>} the recent orders. 
 */
orders.getRecentOrders = async function() {
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);

  try {
    const orderList = await orders._db.listDir('orders');
    const recentOrders = [];

    for (const order of orderList) {
      const userOrders = await orders._db.read('orders', order);

      for (const orderData of userOrders) {
        if (orderData.createdAt > twentyFourHoursAgo) {
          recentOrders.push(orderData);
        }
      }
    }

    return { statusCode: 200, data: recentOrders };
  } catch(e) {
    console.error(e);
    return { statusCode: 500, data: 'Unable to get the recent orders' };
  }
}

/**
 * Searches for an order given it's stripe ID.
 * @param {import('http').IncomingMessage} req the server request object.
 * @return {Promise<{ statusCode: number, data: any}>} the order that matches the given ID.
 */
orders.getOrder = async function(req) {
  const params = req.parsedUrl.query;
  const stripeId = orders._validator.validate(params.stripeId, 'required|minChar:1') && params.stripeId;

  if (!stripeId) {
    return { statusCode: 400, data: { Error: 'Invalid stripe ID' } };
  }

  try {
    const orderList = await orders._db.listDir('orders');

    for (const order of orderList) {
      const userOrders = await orders._db.read('orders', order);

      for (const orderData of userOrders) {
        if (orderData.stripeId === stripeId) {
          return { statusCode: 200, data: orderData };
        }
      }
    }

    return { statusCode: 400, data: { Error: 'Stripe ID did not match any order.' } };
  } catch(e) {
    console.error(e);
    return { statusCode: 500, data: { Error: 'Could not get the order given the ID.' } };
  }
}

module.exports = orders;
