/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};

// Config
app.config = {
  'sessionToken': false
};

// AJAX Client (for RESTful API)
app.client = {}

// Interface for making API calls
app.client.request = function (headers, path, method, queryStringObject, payload, callback) {

  // Set defaults
  headers = typeof (headers) == 'object' && headers !== null ? headers : {};
  path = typeof (path) == 'string' ? path : '/';
  method = typeof (method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof (payload) == 'object' && payload !== null ? payload : {};
  callback = typeof (callback) == 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  var requestUrl = path + '?';
  var counter = 0;
  for (var queryKey in queryStringObject) {
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++;
      // If at least one query string parameter has already been added, preprend new ones with an ampersand
      if (counter > 1) {
        requestUrl += '&';
      }
      // Add the key and value
      requestUrl += queryKey + '=' + queryStringObject[queryKey];
    }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for (var headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  // If there is a current session token set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.token);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      var statusCode = xhr.status;
      var responseReturned = xhr.responseText;

      // Callback if requested
      if (callback) {
        try {
          var parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }

      }
    }
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};

// Bind the logout button
app.bindLogoutButton = function () {
  document.getElementById("logoutButton").addEventListener("click", function (e) {

    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.logUserOut();

  });
};

// Log the user out then redirect them
app.logUserOut = function (redirectUser) {
  // Set redirectUser to default to true
  redirectUser = typeof (redirectUser) == 'boolean' ? redirectUser : true;

  // Get the current token id
  var tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // Send the current token to the tokens endpoint to delete it
  var queryStringObject = {
    'id': tokenId
  };
  app.client.request(undefined, '/api/users/logout', 'DELETE', queryStringObject, undefined, function (statusCode, responsePayload) {
    // Set the app.config token as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if (redirectUser) {
      window.location = '/logout';
    }

  });
};

// Bind the forms
app.bindForms = function () {
  if (document.querySelector("form")) {

    var allForms = document.querySelectorAll("form");
    for (var i = 0; i < allForms.length; i++) {
      allForms[i].addEventListener("submit", function (e) {

        // Stop it from submitting
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();

        // Hide the error message (if it's currently shown due to a previous error)

        if (document.querySelector("#" + formId + " .formError")) {
          document.querySelector("#" + formId + " .formError").style.display = 'none';
        }

        // Hide the success message (if it's currently shown due to a previous error)
        if (document.querySelector("#" + formId + " .formSuccess")) {
          document.querySelector("#" + formId + " .formSuccess").style.display = 'none';
        }


        // Turn the inputs into a payload
        var payload = {};
        var elements = this.elements;
        for (var i = 0; i < elements.length; i++) {
          if (elements[i].type !== 'submit') {
            // Determine class of element and set value accordingly
            var classOfElement = typeof (elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
            var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
            var elementIsChecked = elements[i].checked;
            // Override the method of the form if the input's name is _method
            var nameOfElement = elements[i].name;
            if (nameOfElement == '_method') {
              method = valueOfElement;
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if (nameOfElement == 'httpmethod') {
                nameOfElement = 'method';
              }
              // Create an payload field named "id" if the elements name is actually uid
              if (nameOfElement == 'uid') {
                nameOfElement = 'id';
              }
              // If the element has the class "multiselect" add its value(s) as array elements
              if (classOfElement.indexOf('multiselect') > -1) {
                if (elementIsChecked) {
                  payload[nameOfElement] = typeof (payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else {
                payload[nameOfElement] = valueOfElement;
              }

            }
          }
        }


        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == 'DELETE' ? payload : {};

        // Call the API
        app.client.request(undefined, path, method, queryStringObject, payload, function (statusCode, responsePayload) {
          // Display an error on the form if needed
          if (statusCode > 300) {

            if (statusCode == 403) {
              // log the user out
              app.logUserOut();

            } else {

              // Try to get the error from the api, or set a default error message
              var error = typeof (responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

              // Set the formError field with the error text
              document.querySelector("#" + formId + " .formError").innerHTML = error;

              // Show (unhide) the form error field on the form
              document.querySelector("#" + formId + " .formError").style.display = 'block';
            }
          } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId, payload, responsePayload);
          }

        });
      });
    }
  }
};

// Form response processor
app.formResponseProcessor = function (formId, requestPayload, responsePayload) {

  // If login was successful, set the token in localstorage and redirect the user
  if (formId == 'sessionCreate') {
    app.setSessionToken(responsePayload);
    window.location = '/home';
  }

  if (formId == 'ordersForm') {
    window.location = '/home';
  }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {
  var tokenString = localStorage.getItem('persist:token');
  if (typeof (tokenString) == 'string') {
    try {
      var token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if (typeof (token) == 'object') {
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    } catch (e) {
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function (add) {
  var target = document.querySelector("body");
  if (add) {
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function (token) {
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('persist:token', tokenString);
  if (typeof (token) == 'object') {
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Load data on the page
app.loadDataOnPage = function () {
  // Get the current page from the body class
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = typeof (bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  // Logic for dashboard page
  if (primaryClass == 'homePage') {
    app.loadMenu();
    app.loadOrders();
  }
};

// Given the table ID and the table data, insert the data into the table.
app.insertDataIntoTable = function(tableId, tableData) {
  const table = document.getElementById(tableId);
  table.innerHTML = '';
  for (const rowData of tableData) {
    const tr = table.insertRow(-1);
    tr.classList.add('checkRow');
    for(const cellData of rowData) {
      const td = tr.insertCell(-1);

      if (cellData instanceof HTMLElement) {
        td.appendChild(cellData);
      } else {
        td.innerHTML = cellData;
      }
    }
  }
};

// Add the given itemId to the shopping cart, makes API call and updates the frontend.
app.addItemToShoppingList = function(itemId) {
  app.client.request(undefined, '/api/users/cart', 'POST', { itemId }, undefined, function(statusCode, responsePayload) {
    if (statusCode > 300) {
      console.log(responsePayload);
      return app.logUserOut();
    }
    const item = Object.values(app.menuHash).find(item => item.id === itemId);

    if (item) {
      item.quantity++;
      item.total += item.cost;
      app.refreshShoppingCartTable();
    };
  });
};

// Removes the given itemId to the shopping cart, makes API call and updates the frontend.
app.removeItemToShoppingList = function(itemId) {
  app.client.request(undefined, '/api/users/cart', 'DELETE', { itemId }, undefined, function(statusCode, responsePayload) {
    if (statusCode > 300) {
      console.log(responsePayload);
      return app.logUserOut();
    }
    const item = Object.values(app.menuHash).find(item => item.id === itemId);

    if (item) {
      item.quantity--;
      item.total -= item.cost;
      app.refreshShoppingCartTable();
    };
  });
};

// Helper to create a button
app.createButton = function(onclick, text) {
  const button = document.createElement('button');
  button.onclick = onclick;
  button.innerHTML = text;
  button.style.border = '1px solid black';
  button.style.borderRadius = '5px';
  button.style.padding = '5px';
  return button;
}

// Load the menu items
app.loadMenu = function() {
  app.client.request(undefined, '/api/menu', 'GET', undefined, undefined, function(statusCode, responsePayload) {

    if (statusCode > 300) {
      console.log(responsePayload);
      return app.logUserOut();
    }
    const menuTableData = [];
    for (const item of responsePayload) {
      const onBtnClick = () => app.addItemToShoppingList(item.id);
      const button = app.createButton(onBtnClick, 'Add to Cart');
      menuTableData.push([
        item.id,
        item.name,
        item.cost,
        button
      ]);
    }
    app.insertDataIntoTable('menuListTable', menuTableData);
    app.loadMenuHash(responsePayload);
    app.loadItems();
  });
};

// Loads a key-value hash to quickly get the items with their total and quantity
app.loadMenuHash = function(menuData) {
  const menuHash = {};
  for (const menuItem of menuData) {
    menuHash[menuItem.id] = {...menuItem, total: 0, quantity: 0};
  }
  app.menuHash = menuHash;
  app.shoppingCartItems = [];
};

// Refreshes the shopping cart in the frontend.
app.refreshShoppingCartTable = function() {
  const menuHash = app.menuHash;
  const placeOrder = document.querySelector('.placeOrder');

  const itemsTableData = [];
  Object
    .values(menuHash)
    .filter(item => item.quantity > 0)
    .forEach(item => itemsTableData.push([
      item.name, 
      item.quantity, 
      item.total,
      app.createButton(() => app.removeItemToShoppingList(item.id), 'Remove from cart'),
    ]));

  placeOrder.style.display = itemsTableData.length ? 'block' : 'none';
  app.insertDataIntoTable('shoppingCartTable', itemsTableData);
};

// Load the orders into the frontend
app.loadOrders = function() {

  app.client.request(undefined, '/api/users/orders', 'GET', undefined, undefined, function(statusCode, responsePayload) {
    if (statusCode > 300) {
      console.log(responsePayload);
      return app.logUserOut();
    }

    const ordersTableData = [];
    for (const order of responsePayload) {
      ordersTableData.push([
        order.stripeId,
        order.items.map(item => item.name).join(),
        order.items.reduce((sum, item) => sum+= item.cost, 0),
      ]);
    }
    app.insertDataIntoTable('ordersTable', ordersTableData);
  });
};

// Load the items into the frontend.
app.loadItems = function() {
  const menuHash = app.menuHash;

  app.client.request(undefined, '/api/users/cart', 'GET', undefined, undefined, function(statusCode, responsePayload) {
    if (statusCode > 300) {
      console.log(responsePayload);
      return app.logUserOut();
    }

    for (const itemId of responsePayload) {
      const item = menuHash[itemId];
      if (item) {
        item.quantity++;
        item.total += item.cost;
      }
    }
    app.refreshShoppingCartTable();
  });
};

// Init (bootstrapping)
app.init = function () {

  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Get the token from  localstorage
  app.getSessionToken();

  // Load data on page
  app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function () {
  app.init();
};