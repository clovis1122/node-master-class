'use strict';

/**
 * A db-like utility to store and retrieve data from files in the disk.
 * @module
 */
const db = {};

// Dependencies
db._fs = require('fs');
db._path = require('path');
db._util = require('util');

db._config = require('../../config');

// Creates promisified versions of some of the fs utilities that we'll be using.
db._unlinkAsync = db._util.promisify(db._fs.unlink);
db._readdirAsync = db._util.promisify(db._fs.readdir);
db._truncateAsync = db._util.promisify(db._fs.truncate);
db._readFileAsync = db._util.promisify(db._fs.readFile);
db._writeFileAsync = db._util.promisify(db._fs.writeFile);

// Set the base dir where the data of the system will reside.
db.baseDir = db._config.dataDirectory;

/**
 * Creates a new file with the given data in the given directory. The data is
 * converted to a JSON string before being saved.
 * @param {string} directory the directory (or path) where to store the file.
 * NOTE: the folders must exist before calling this method.
 * @param {string} file the name of the file to create. This method will automatically
 * add ".json" at the end of the name.
 * @param {*} data the data to save. It will be converted to JSON by the method.
 * @return {Promise<void>}
 */
db.create = async function (directory, file, data) {
  const path = db.baseDir+'/'+directory+'/'+file+'.json';
  try {
    const stringData = JSON.stringify(data);
    await db._writeFileAsync(path, stringData, { flag: 'wx' } );
  } catch(e) {
    throw new Error('There was an error creating the data from the system.');
  }
}

/**
 * Attempts to read the given filename in the given directory.
 * @param {string} directory the directory (or path) where to read for the file.
 * @param {string} file the name of the file to read. It will be appended ".json"
 * at the end.
 * @return {Promise<*>} the parsed content of the JSON file.
 */
db.read = async function (directory, file) {
  const path = db.baseDir+'/'+directory+'/'+file+'.json';

  try {
    const fileData = await db._readFileAsync(path, 'utf-8');
    return JSON.parse(fileData);
  } catch(e) {
    throw new Error('There was an error reading the data from the system.');
  }
}

db.listDir = async function (directory) {
  const dirData = await db._readdirAsync(db.baseDir+'/'+directory);
  return dirData.map(file => file.replace('.json', ''));
}

/**
 * Updates the given file in the given directory with the given data.
 * @param {string} directory the directory (or path) where to store the file.
 * NOTE: the folders must exist before calling this method.
 * @param {string} file the name of the file to update. This method will automatically
 * add ".json" at the end of the name.
 * @param {*} data the data to save. It will be converted to JSON by the method.
 * @return {Promise<void>}
 */
db.update = async function (directory, file, data) {
  const path = db.baseDir+'/'+directory+'/'+file+'.json';
  try {
    const stringData = JSON.stringify(data);
    await db._truncateAsync(path);
    await db._writeFileAsync(path, stringData);
  } catch(e) {
    throw new Error('There was an error updating the data from the system.');
  }
}

/**
 * Deletes the given file in the given directory.
 * @param {string} directory the directory (or path) where the file is located.
 * @param {string} file the name of the file to delete. It will be appended ".json"
 * at the end.
 * @return {Promise<void>}
 */
db.delete = async function (directory, file) {
  const path = db.baseDir+'/'+directory+'/'+file+'.json';
  try {
    await db._unlinkAsync(path);
  } catch(e) {
    throw new Error('There was an error deleting the data from the system.');
  }
}

module.exports = db;
