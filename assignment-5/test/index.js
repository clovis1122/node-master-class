'use strict';

/**
 * Test runner for Sum.js
 */

// Dependencies
const assert = require('assert');
const sum = require('../app/lib/sum');

// Container for the tests
const _app = {};
_app.tests = { 'unit': {} };

// Tests for the addTwoNumbers function.
_app.tests.unit['addTwoNumbers function adds 2 + 2 and return 4'] = function (done) {
  const result = sum.addTwoNumbers(2, 2);
  assert.equal(result, 4);
  assert.equal(typeof (result), 'number');
  done();
};

_app.tests.unit['addTwoNumbers function replaces null with 0'] = function (done) {
  const result = sum.addTwoNumbers(null, 2);
  assert.equal(result, 2);
  assert.equal(typeof (result), 'number');
  done();
};

// Tests for the addTwoNumbers function.
_app.tests.unit['addAllNumbers function sums all the parameters'] = function (done) {
  const result = sum.addAllNumbers(2, 3, 5);
  assert.equal(result, 10);
  assert.equal(typeof (result), 'number');
  done();
};

_app.tests.unit['addAllNumbers function ignores non-numeric parameters'] = function (done) {
  const result = sum.addAllNumbers(2, null, 'string', 3, [], function () {}, {}, 5);
  assert.equal(result, 10);
  assert.equal(typeof (result), 'number');
  done();
};

// Gives the count of the tests.
_app.countTests = function () {
  let counter = 0;
  Object
    .values(_app.tests)
    .forEach(tests => counter += Object.keys(tests).length);

  return counter;
};

// Run all the tests, collecting the errors and successes
_app.runTests = function () {
  const errors = [];
  let successes = 0;
  const limit = _app.countTests();
  let counter = 0;
  for (const key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      const subTests = _app.tests[key];
      for (const testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          (function () {
            const tmpTestName = testName;
            const testValue = subTests[testName];
            // Call the test
            try {
              testValue(function () {

                // If it calls back without throwing, then it succeeded, so log it in green
                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                counter++;
                successes++;
                if (counter == limit) {
                  _app.produceTestReport(limit, successes, errors);
                }
              });
            } catch (e) {
              // If it throws, then it failed, so capture the error thrown and log it in red
              errors.push({
                'name': testName,
                'error': e
              });
              console.log('\x1b[31m%s\x1b[0m', tmpTestName);
              counter++;
              if (counter == limit) {
                _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};


// Product a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
  console.log("");
  console.log("--------BEGIN TEST REPORT--------");
  console.log("");
  console.log("Total Tests: ", limit);
  console.log("Pass: ", successes);
  console.log("Fail: ", errors.length);
  console.log("");

  // If there are errors, print them in detail
  if (errors.length > 0) {
    console.log("--------BEGIN ERROR DETAILS--------");
    console.log("");
    errors.forEach(function (testError) {
      console.log('\x1b[31m%s\x1b[0m', testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------END ERROR DETAILS--------");
  }
  console.log("");
  console.log("--------END TEST REPORT--------");
  process.exit(0);

};

// Run the tests
_app.runTests();
