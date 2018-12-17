/*
 * The router file contains all the routers for the application.
 */

module.exports = {
  hello: (data, callback) => callback(200, { message: 'Hello from the other sideeee' }),
  notFound: (data, callback) => callback(404),
};
