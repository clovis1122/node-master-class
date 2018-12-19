/*
 * The router file contains all the routers for the application.
 */

module.exports = {
  hello: (data, callback) => {
    if (data.method !== 'post') {
      return callback(405, { message: 'HTTP Method not supported.' });
    }
    return callback(200, { message: 'Hello from the other sideeee' });
  },
  notFound: (data, callback) => callback(404),
};
