'use strict';

/**
 * Groups several validation functions together to be used against objects of any kind.
 * @module
 */
const validator = {};

/**
 * Given a set of rules, determines if the given value passes them.
 * @param {string?} answer the answer to evaluate.
 * @param {string} rules the rules to evaluate. These can be joined by a pipe
 * (|) and they will all be applied to the element. Available rules: "required",
 * "integer", "minChar:len" where len is the minimum length of the answer.
 * @return {boolean} if the answer passes the given set of rules or not.
 * @example 
 * validator.validate('12345', 'required|minChar:3'); // true
 * validator.validate('12345', 'required|minChar:7'); // false
 */
validator.validate = function(answer, rules) {
  // Split the rules by "|".
  return rules.split('|').every((rule) => {
    if (rule == 'required') {
      return answer;
    }

    if (rule == 'integer') {
      return isFinite(answer);
    }

    // Destructure the rule since it might be in the "rule:number" format.
    const [ruleField, value] = rule.split(':');

    if (ruleField == 'minChar') {
      return answer && answer.length >= Number(value);
    }

  });
}

module.exports = validator;
