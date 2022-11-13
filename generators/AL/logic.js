/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating AL for logic blocks.
 */
'use strict';

goog.module('Blockly.AL.logic');

const {alGenerator: AL} = goog.require('Blockly.AL');


AL['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '';
  if (AL.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += AL.injectId(AL.STATEMENT_PREFIX, block);
  }
  do {
    const conditionCode =
        AL.valueToCode(block, 'IF' + n, AL.ORDER_NONE) || 'false';
    let branchCode = AL.statementToCode(block, 'DO' + n);
    if (AL.STATEMENT_SUFFIX) {
      branchCode = AL.prefixLines(
          AL.injectId(AL.STATEMENT_SUFFIX, block), AL.INDENT) + branchCode;
    }
    code +=
        (n > 0 ? 'else' : '') + 'if ' + conditionCode + ' then begin\n' + branchCode;
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || AL.STATEMENT_SUFFIX) {
    let branchCode = AL.statementToCode(block, 'ELSE');
    if (AL.STATEMENT_SUFFIX) {
      branchCode = AL.prefixLines(
                       AL.injectId(AL.STATEMENT_SUFFIX, block), AL.INDENT) +
          branchCode;
    }
    code += 'end else begin\n' + branchCode;
  }
  return code + 'end;\n';
};

AL['controls_ifelse'] = AL['controls_if'];

AL['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '=', 'NEQ': '<>', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const argument0 = AL.valueToCode(block, 'A', AL.ORDER_RELATIONAL) || '0';
  const argument1 = AL.valueToCode(block, 'B', AL.ORDER_RELATIONAL) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, AL.ORDER_RELATIONAL];
};

AL['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? 'and' : 'or';
  const order = (operator === 'and') ? AL.ORDER_AND : AL.ORDER_OR;
  let argument0 = AL.valueToCode(block, 'A', order);
  let argument1 = AL.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    const defaultArgument = (operator === 'and') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

AL['logic_negate'] = function(block) {
  // Negation.
  const argument0 = AL.valueToCode(block, 'BOOL', AL.ORDER_UNARY) || 'true';
  const code = 'not ' + argument0;
  return [code, AL.ORDER_UNARY];
};

AL['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, AL.ORDER_ATOMIC];
};

AL['logic_null'] = function(block) {
  // Null data type.
  return ['nil', AL.ORDER_ATOMIC];
};

AL['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if = AL.valueToCode(block, 'IF', AL.ORDER_AND) || 'false';
  const value_then = AL.valueToCode(block, 'THEN', AL.ORDER_AND) || 'nil';
  const value_else = AL.valueToCode(block, 'ELSE', AL.ORDER_OR) || 'nil';
  const code = value_if + ' and ' + value_then + ' or ' + value_else;
  return [code, AL.ORDER_OR];
};
