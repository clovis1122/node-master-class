'use strict';

/**
 * Initializes the different templates that exists in the WEBAPP.
 * @module
 */
const web = {};

// Dependencies
web._fs = require('fs');
web._util = require('util');

web._config = require('../config');
web._router = require('../lib/router');
web._templateParser = require('../lib/template-parser');

web._readFileAsync = web._util.promisify(web._fs.readFile);

// Supported content types, key-value pair.
web._contentTypes = {
  js: 'text/js',
  css: 'text/css',
  png: 'image/png',
  jpeg: 'image/jpeg',
  ico: 'image/x-icon'
};

// Returns an HTTP 200 HTML and loads the given template with the given data.
web._getScreenFromTemplate = function(template, data = { body: { class: '' } }) {
  return async function() {
    return {
      statusCode: 200,
      contentType: 'text/html',
      data: await web._templateParser.loadTemplate(template, data),
    };
  };
};

// Static assets handler, attempts to load the given static file.
web._staticAssetsHandler = async function(details) {
  const path = web._config.assetsDirectory+details.path;
  try {
    const data = await web._readFileAsync(path);
    const extension = path.substr(path.lastIndexOf('.')+1);
    const contentType = web._contentTypes[extension] || 'text/plain';

    return { statusCode: 200, contentType, data };
  } catch(e) {
    return { statusCode: 404, contentType: 'text/plain', data: 'The requested file was not found in this server.' };
  }
}

/**
 * Initializes the WEBAPP by registering all the routes with their handler.
 */
web.initialize = function()  {
  web._router.registerSingleHandler('/', web._getScreenFromTemplate('login'));
  web._router.registerSingleHandler('/login', web._getScreenFromTemplate('login'));
  web._router.registerSingleHandler('/logout', web._getScreenFromTemplate('logout'));
  web._router.registerSingleHandler('/register', web._getScreenFromTemplate('register'));
  web._router.registerSingleHandler('/home', web._getScreenFromTemplate('home', { body: { class: 'homePage' }}));
  web._router.registerSingleHandler('/orders/create', web._getScreenFromTemplate('orders'));
  web._router.registerStaticAssetHandler(web._staticAssetsHandler);
};

module.exports = web;
