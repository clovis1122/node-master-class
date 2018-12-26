'use strict';

/**
 * Contains the logic to interact with the stripe API.
 * @module
 */
const stripe = {};

// Dependencies
stripe._request = require('../request');
stripe._config = require('../../config');

/**
 * Charge the user's credit card using stripe.
 * @param {string} creditCard the user's credit card.
 * @param {number} amount the amount to charge to the user.
 * @return {Promise<number>} the ID of the stripe transaction.
 */
stripe.chargeUser = async function(creditCard, amount) {
  const url = stripe._config.stripeUrl+'/charges';
  const params = { 
    amount,
    source: creditCard,
    currency: 'usd', 
  };

  const stripeOptions = {
    auth: `${stripe._config.stripeKey}:`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: params
  };

  try {
    const response = await stripe._request.makeRequestAsync(url, null, stripeOptions);
    const stripeData = await stripe._request.parseResponseData(response);
    const { data } = JSON.parse(stripeData);
    const [chargeObject] = data;

    if (chargeObject.status !== 'succeeded') {
      throw new Error('Transaction could not be completed.');
    }

    return chargeObject.id;
  } catch(e) {
    throw new Error('There was an error connecting to Stripe to process the payment.');
  }
}

module.exports = stripe;
