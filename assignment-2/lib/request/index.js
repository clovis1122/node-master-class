'use strict';

/**
 * An abstraction on the top of HTTPS to make async requests.
 * @module
 */
const request = {};

// Dependencies
request._https = require('https');
request._querystring = require('querystring');

/**
 * Asyncronously makes a request.
 * @param {string} url the URL to which to make the request to.
 * @param {params} the querystring parameters. These will be appended
 * to URL on a GET request.
 * @param {{}} options the options object to pass to the http.request call.
 * @return {Promise<import('http').IncomingMessage}
 */
request.makeRequestAsync = function(url, params, options) {
  let newUrl = url;
  // For GET method, append the params as querystring.
  if (params && (!options.method || options.method === 'GET')) {
    newUrl += '?'+request._querystring.stringify(params);
  }

  // Return a promise. This will allow us to convert the call to http to an
  // async-like function.
  return new Promise(function(resolve, reject) {

    // Makes the request. On error, reject the promise.
    const req = request._https.request(newUrl, options, resolve).on('error', reject);

    // when the method is not GET and if there's a data option, write it in the request.
    if (options.data && options.method !== 'GET') {
      let newData = options.data;
      // for URLENCODED content type, convert the data to a querystring.
      if (options.headers  && options.headers['Content-Type'] === 'application/x-www-form-urlencoded')  {
        newData = request._querystring.stringify(options.data);
      }
      req.write(newData);
    }

    // Ends the stream. This will fire the request.
    req.end();
  });
};

/**
 * Asyncronously parses the data that comes from a response.
 * @param {Promise<import('http').IncomingMessage} res the incoming message request.
 * @return {string} the raw request data.
 */
request.parseResponseData = function(res) {
  return new Promise(function(resolve, reject) {
    let rawData = '';
    res.on('data', data => rawData += data)
       .on('end', () => resolve(rawData))
       .on('error', reject);
  });
};

module.exports = request;
