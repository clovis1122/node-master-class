/*
 * CLI-related tasks
 *
 */

// Dependencies
const readline = require('readline');
const events = require('events');
class _events extends events {};
const e = new _events();

// Instantiate the cli module object
const cli = {};

cli._menu = require('../api/menu');
cli._users = require('../api/users');
cli._auth = require('../api/users/auth');
cli._orders = require('../api/users/orders');

// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = function () {

  // Codify the commands and their explanations
  const commands = {
    'exit': 'Kill the CLI (and the rest of the application)',
    'man': 'Show this help page',
    'help': 'Alias of the "man" command',
    'menu': 'Get all the menu items',
    'specific-order --{orderId}': 'View one specific order details',
    'specific-user --{userId}': 'View one specific user details',
    'recent-users': 'View recent users (last 24 hours)',
    'recent-orders': 'View all the recent orders (last 24 hours)',
  };

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively
  for (const key of commands) {
    if (commands.hasOwnProperty(key)) {
      const value = commands[key];
      let line = '      \x1b[33m ' + key + '      \x1b[0m';
      const padding = 60 - line.length;
      for (let i = 0; i < padding; i++) {
        line += ' ';
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }
  cli.verticalSpace(1);

  // End with another horizontal line
  cli.horizontalLine();

};

// Create a vertical space
cli.verticalSpace = function (lines) {
  lines = typeof (lines) == 'number' && lines > 0 ? lines : 1;
  for (let i = 0; i < lines; i++) {
    console.log('');
  }
};

// Create a horizontal line across the screen
cli.horizontalLine = function () {

  // Get the available screen size
  var width = process.stdout.columns;

  // Put in enough dashes to go across the screen
  var line = '';
  for (let i = 0; i < width; i++) {
    line += '-';
  }
  console.log(line);
};

// Create centered text on the screen
cli.centered = function (str) {
  str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : '';

  // Get the available screen size
  const width = process.stdout.columns;

  // Calculate the left padding there should be
  const leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  let line = '';
  for (i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  line += str;
  console.log(line);
};

// Exit
cli.responders.exit = function () {
  process.exit(0);
};

cli.responders.menu = async function () {
  const {
    statusCode,
    data
  } = await cli._menu.get();

  if (statusCode === 200) {
    for (const item of data) {
      console.log(`ID: ${item.id} | NAME: ${item.name} | COST: ${item.cost}`);
    }
  } else {
    console.error('There was an error performing this action: ', data);
  }
};

cli.responders.recentOrders = async function () {
  const {
    statusCode,
    data
  } = await cli._orders.getRecentOrders();

  if (statusCode === 200) {
    if (data.length === 0) {
      console.log('There are no recent orders.');
    } else {
      data.forEach(order => console.log(
        `STRIPE ID: ${order.stripeId} | CREATED AT: ${new Date(order.createdAt)} | ITEMS: ${order.items.map(item => item.name).join()}`
      ));
    }
  } else {
    console.error('There was an error performing this action: ', data);
  }
};

cli.responders.specificOrder = async function (userInput) {

  // Get the stripe ID.
  const stripeId = userInput.split('--')[1];

  // Since the orders controller is expecting a req object from which to extract the information of,
  // we'll pass an object that behaves like one.
  const fakeReq = {
    parsedUrl: {
      query: {
        stripeId
      }
    }
  };
  const {
    statusCode,
    data
  } = await cli._orders.getOrder(fakeReq);

  if (statusCode === 200) {
    console.log(
      `STRIPE ID: ${data.stripeId} | CREATED AT: ${new Date(data.createdAt)} | ITEMS: ${data.items.map(item => item.name).join()}`
    );
  } else {
    console.error('There was an error performing this action: ', data);
  }
};

cli.responders.recentUsers = async function () {
  const {
    statusCode,
    data
  } = await cli._auth.getRecentLoginUsers();

  if (statusCode === 200) {
    data.forEach(email => console.log('EMAIL: ' + email));
  } else {
    console.error('There was an error performing this action: ', data);
  }
};

cli.responders.specificUser = async function (userInput) {
  // Get the email of the user
  const email = userInput.split('--')[1];

  // Since the users controller is expecting a req object from which to extract the information of,
  // we'll pass an object that behaves like one.
  const fakeReq = {
    parsedUrl: {
      query: {
        email
      }
    }
  };
  const {
    statusCode,
    data
  } = await cli._users.getUser(fakeReq);

  if (statusCode === 200) {
    console.log(`NAME: ${data.name} | EMAIL: ${data.email} | ADDRESS: ${data.address}`);
  } else {
    console.error('There was an error performing this action: ', data);
  }
};

// Input handlers
e.on('man', cli.responders.help);
e.on('help', cli.responders.help);
e.on('exit', cli.responders.exit);

e.on('menu', cli.responders.menu);
e.on('specific-user', cli.responders.specificUser);
e.on('specific-order', cli.responders.specificOrder);
e.on('recent-users', cli.responders.recentUsers);
e.on('recent-orders', cli.responders.recentOrders);

// Input processor
cli.processInput = function (str) {
  str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something, otherwise ignore it
  if (str) {
    // Codify the unique strings that identify the different unique questions allowed be the asked
    const uniqueInputs = [
      'man',
      'help',
      'exit',
      'menu',
      'recent-orders',
      'specific-order',
      'recent-users',
      'specific-user',
    ];

    // Go through the possible inputs, emit event when a match is found
    let matchFound = false;
    uniqueInputs.some(function (input) {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(input, str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Sorry, try again");
    }

  }
};

// Init script
cli.initialize = function () {

  // Send to console, in dark blue
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

  // Start the interface
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'admin>> '
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', function (str) {

    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on('close', function () {
    process.exit(0);
  });

};

// Export the module
module.exports = cli;