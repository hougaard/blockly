/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating AL for procedure blocks.
 */
'use strict';

goog.module('Blockly.AL.procedures');

const { NameType } = goog.require('Blockly.Names');
const { alGenerator: AL } = goog.require('Blockly.AL');


AL['procedures_defreturn'] = function (block) {
  // Define a procedure with a return value.
  const funcName =
    AL.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (AL.STATEMENT_PREFIX) {
    xfix1 += AL.injectId(AL.STATEMENT_PREFIX, block);
  }
  if (AL.STATEMENT_SUFFIX) {
    xfix1 += AL.injectId(AL.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = AL.prefixLines(xfix1, AL.INDENT);
  }
  let loopTrap = '';
  if (AL.INFINITE_LOOP_TRAP) {
    loopTrap = AL.prefixLines(
      AL.injectId(AL.INFINITE_LOOP_TRAP, block), AL.INDENT);
  }
  let branch = AL.statementToCode(block, 'STACK');
  let returnValue = AL.valueToCode(block, 'RETURN', AL.ORDER_NONE) || '';
  let returnValueType = AL.valueToType(block, 'RETURN', AL.ORDER_NONE);
  switch (returnValueType) {
    case "math_number":
    case "math_arithmetic":
      returnValueType = "decimal";
      break;
    case "logic_boolean":
      returnValueType = "Boolean";
      break;
  }
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = AL.INDENT + 'exit(' + returnValue + ');\n';
  } else if (!branch) {
    branch = '';
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = AL.nameDB_.getName(variables[i], NameType.VARIABLE);
  }
  let code = 'procedure ' + funcName + '(' + args.join(', ') + ') : ' + returnValueType + '\nbegin\n' + xfix1 +
    loopTrap + branch + xfix2 + returnValue + 'end;\n';
  code = AL.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  AL.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
AL['procedures_defnoreturn'] = AL['procedures_defreturn'];

AL['procedures_callreturn'] = function (block) {
  // Call a procedure with a return value.
  const funcName =
    AL.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = AL.valueToCode(block, 'ARG' + i, AL.ORDER_NONE) || 'nil';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  return [code, AL.ORDER_HIGH];
};

AL['procedures_callnoreturn'] = function (block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = AL['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

AL['procedures_ifreturn'] = function (block) {
  // Conditionally return value from a procedure.
  const condition =
    AL.valueToCode(block, 'CONDITION', AL.ORDER_NONE) || 'false';
  let code = 'if ' + condition + ' then begin\n';
  if (AL.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code +=
      AL.prefixLines(AL.injectId(AL.STATEMENT_SUFFIX, block), AL.INDENT);
  }
  if (block.hasReturnValue_) {
    const value = AL.valueToCode(block, 'VALUE', AL.ORDER_NONE) || 'nil';
    code += AL.INDENT + 'exit(' + value + ');\n';
  } else {
    code += AL.INDENT + 'exit;\n';
  }
  code += 'end;\n';
  return code;
};
