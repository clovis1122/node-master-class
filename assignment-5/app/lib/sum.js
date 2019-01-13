/**
 * Simple module that adds the given numbers.
 */

exports.addTwoNumbers = function(a, b) {
  if (typeof(a) !== 'number') {
    a = 0;
  }
  if (typeof(b) !== 'number') {
    b = 0;
  }
  return a + b;
}


exports.addAllNumbers = (...numbers) => numbers.reduce((sum, number) => {
  return typeof(number) === 'number' ? sum+number : sum;
});
