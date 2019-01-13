'use strict';

/**
 * A module with helpers that operates on objects.
 * @module
 */
const objectHelpers = {};

/**
 * Given an object and a path, tries to access that property of the object. Returns undefined
 * if the property does not exist.
 */
objectHelpers.get = function(object, path = '') {
  return path.split('.').reduce(function(currentProperty, key) {
    if (currentProperty === undefined) return undefined;
    return currentProperty[key];
  }, object);
}

module.exports = objectHelpers;
