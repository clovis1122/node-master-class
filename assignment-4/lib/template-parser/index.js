'use strict';

/**
 * Contains the logic to parse, interpolate and correctly handle templates.
 * @module
 */
const templateParser = {};

// Dependencies
templateParser._fs = require('fs');
templateParser._util = require('util');
templateParser._path = require('path');

templateParser._config = require('../../config');
templateParser._objectHelper = require('../object-helpers');

// Async version of readFile.
templateParser._readFileAsync = templateParser._util.promisify(templateParser._fs.readFile);

// Template folder
templateParser.templatesDir = templateParser._config.templateDirectory;

// Load the given template with the given data.
templateParser.loadTemplate = async function(name, data) {
  const templatePath = templateParser._path.join(templateParser.templatesDir, name+'.template.html');
  let template;

  // Check that the template exists
  try {
    template = await templateParser._readFileAsync(templatePath, 'UTF-8');
  } catch(e) {
    throw new Error('Could not load template: ', name);
  }

  // Check for @include directives, that allows to extend a template to include another template.
  const matchIncludeExpression = /(@include\(.*\))/;
  const matchIncludePath = /@include\('(.*)'\)/;
  const templateParts = template.split(matchIncludeExpression);

  for (const templatePartIndex in templateParts) {
    const templatePart = templateParts[templatePartIndex];
    const [,path] = templatePart.match(matchIncludePath) || [];

    // If the path matches, load the sub-template.
    if (path) {
      templateParts[templatePartIndex] = await templateParser.loadTemplate('_'+path, data);
    }
  }

  // Resolves the template expressions {{ }}
  const fullTemplate = templateParts.join('');
  const matchTemplateExpression = /\{\{.*\}\}/g;

  return fullTemplate.replace(matchTemplateExpression, function(match) {
    let parsedMath = match.replace(/\{|\}/g, '').trim();
    let value = templateParser._objectHelper.get(data, parsedMath);
    if (parsedMath.startsWith('global.')) {
      value = templateParser._objectHelper.get({ global: templateParser._config }, parsedMath);
    }

    if (value == null) {
      throw new Error(`Unable to render the template, expression ${match} was not found in ${JSON.stringify(data)} or in App config.`);
    }

    return value;
  });

};

module.exports = templateParser;
