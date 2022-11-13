/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating AL for text blocks.
 */
'use strict';

goog.module('Blockly.AL.texts');

const {NameType} = goog.require('Blockly.Names');
const {alGenerator: AL} = goog.require('Blockly.AL');


AL['text'] = function(block) {
  // Text value.
  const code = AL.quote_(block.getFieldValue('TEXT'));
  return [code, AL.ORDER_ATOMIC];
};

// AL['text_multiline'] = function(block) {
//   // Text value.
//   const code = AL.multiline_quote_(block.getFieldValue('TEXT'));
//   const order =
//       code.indexOf('..') !== -1 ? AL.ORDER_CONCATENATION : AL.ORDER_ATOMIC;
//   return [code, order];
// };

// AL['text_join'] = function(block) {
//   // Create a string made up of any number of elements of any type.
//   if (block.itemCount_ === 0) {
//     return ["''", AL.ORDER_ATOMIC];
//   } else if (block.itemCount_ === 1) {
//     const element = AL.valueToCode(block, 'ADD0', AL.ORDER_NONE) || "''";
//     const code = 'tostring(' + element + ')';
//     return [code, AL.ORDER_HIGH];
//   } else if (block.itemCount_ === 2) {
//     const element0 =
//         AL.valueToCode(block, 'ADD0', AL.ORDER_CONCATENATION) || "''";
//     const element1 =
//         AL.valueToCode(block, 'ADD1', AL.ORDER_CONCATENATION) || "''";
//     const code = element0 + ' .. ' + element1;
//     return [code, AL.ORDER_CONCATENATION];
//   } else {
//     const elements = [];
//     for (let i = 0; i < block.itemCount_; i++) {
//       elements[i] = AL.valueToCode(block, 'ADD' + i, AL.ORDER_NONE) || "''";
//     }
//     const code = 'table.concat({' + elements.join(', ') + '})';
//     return [code, AL.ORDER_HIGH];
//   }
// };

AL['text_append'] = function(block) {
  // Append to a variable in place.
  const varName =
      AL.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const value =
      AL.valueToCode(block, 'TEXT', AL.ORDER_CONCATENATION) || "''";
  return varName + ' := ' + varName + ' + ' + value + ';\n';
};

AL['text_length'] = function(block) {
  // String or array length.
  const text = AL.valueToCode(block, 'VALUE', AL.ORDER_UNARY) || "''";
  return ['strlen(' + text + ')', AL.ORDER_UNARY];
};

AL['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  const text = AL.valueToCode(block, 'VALUE', AL.ORDER_UNARY) || "''";
  return [text + ' = \'\'', AL.ORDER_RELATIONAL];
};

AL['text_indexOf'] = function(block) {
  // Search the text for a substring.
  const substring = AL.valueToCode(block, 'FIND', AL.ORDER_NONE) || "''";
  const text = AL.valueToCode(block, 'VALUE', AL.ORDER_NONE) || "''";
  const code = 'strpos(' + text + ', ' + substring + ')';
  return [code, AL.ORDER_HIGH];
};

// AL['text_charAt'] = function(block) {
//   // Get letter at index.
//   // Note: Until January 2013 this block did not have the WHERE input.
//   const where = block.getFieldValue('WHERE') || 'FROM_START';
//   const atOrder = (where === 'FROM_END') ? AL.ORDER_UNARY : AL.ORDER_NONE;
//   const at = AL.valueToCode(block, 'AT', atOrder) || '1';
//   const text = AL.valueToCode(block, 'VALUE', AL.ORDER_NONE) || "''";
//   let code;
//   if (where === 'RANDOM') {
//     const functionName = AL.provideFunction_('text_random_letter', `
// function ${AL.FUNCTION_NAME_PLACEHOLDER_}(str)
//   local index = math.random(string.len(str))
//   return string.sub(str, index, index)
// end
// `);
//     code = functionName + '(' + text + ')';
//   } else {
//     let start;
//     if (where === 'FIRST') {
//       start = '1';
//     } else if (where === 'LAST') {
//       start = '-1';
//     } else {
//       if (where === 'FROM_START') {
//         start = at;
//       } else if (where === 'FROM_END') {
//         start = '-' + at;
//       } else {
//         throw Error('Unhandled option (text_charAt).');
//       }
//     }
//     if (start.match(/^-?\w*$/)) {
//       code = 'string.sub(' + text + ', ' + start + ', ' + start + ')';
//     } else {
//       // use function to avoid reevaALtion
//       const functionName = AL.provideFunction_('text_char_at', `
// function ${AL.FUNCTION_NAME_PLACEHOLDER_}(str, index)
//   return string.sub(str, index, index)
// end
// `);
//       code = functionName + '(' + text + ', ' + start + ')';
//     }
//   }
//   return [code, AL.ORDER_HIGH];
// };

AL['text_getSubstring'] = function(block) {
  // Get substring.
  const text = AL.valueToCode(block, 'STRING', AL.ORDER_NONE) || "''";

  // Get start index.
  const where1 = block.getFieldValue('WHERE1');
  const at1Order = (where1 === 'FROM_END') ? AL.ORDER_UNARY : AL.ORDER_NONE;
  const at1 = AL.valueToCode(block, 'AT1', at1Order) || '1';
  let start;
  if (where1 === 'FIRST') {
    start = 1;
  } else if (where1 === 'FROM_START') {
    start = at1;
  } else if (where1 === 'FROM_END') {
    start = '-' + at1;
  } else {
    throw Error('Unhandled option (text_getSubstring)');
  }

  // Get end index.
  const where2 = block.getFieldValue('WHERE2');
  const at2Order = (where2 === 'FROM_END') ? AL.ORDER_UNARY : AL.ORDER_NONE;
  const at2 = AL.valueToCode(block, 'AT2', at2Order) || '1';
  let end;
  if (where2 === 'LAST') {
    end = -1;
  } else if (where2 === 'FROM_START') {
    end = at2;
  } else if (where2 === 'FROM_END') {
    end = '-' + at2;
  } else {
    throw Error('Unhandled option (text_getSubstring)');
  }
  const code = 'string.sub(' + text + ', ' + start + ', ' + end + ')';
  return [code, AL.ORDER_HIGH];
};

AL['text_changeCase'] = function(block) {
  // Change capitalization.
  const operator = block.getFieldValue('CASE');
  const text = AL.valueToCode(block, 'TEXT', AL.ORDER_NONE) || "''";
  let functionName;
  if (operator === 'UPPERCASE') {
    functionName = 'UpperCase';
  } else if (operator === 'LOWERCASE') {
    functionName = 'LowerCase';
  } else if (operator === 'TITLECASE') {
    functionName = 'UpperCase';
  }
  const code = functionName + '(' + text + ')';
  return [code, AL.ORDER_HIGH];
};

// AL['text_trim'] = function(block) {
//   // Trim spaces.
//   const OPERATORS = {LEFT: '^%s*(,-)', RIGHT: '(.-)%s*$', BOTH: '^%s*(.-)%s*$'};
//   const operator = OPERATORS[block.getFieldValue('MODE')];
//   const text = AL.valueToCode(block, 'TEXT', AL.ORDER_NONE) || "''";
//   const code = 'string.gsub(' + text + ', "' + operator + '", "%1")';
//   return [code, AL.ORDER_HIGH];
// };

AL['text_print'] = function(block) {
  // Print statement.
  const msg = AL.valueToCode(block, 'TEXT', AL.ORDER_NONE) || "''";
  return 'message(' + msg + ');\n';
};

// AL['text_prompt_ext'] = function(block) {
//   // Prompt function.
//   let msg;
//   if (block.getField('TEXT')) {
//     // Internal message.
//     msg = AL.quote_(block.getFieldValue('TEXT'));
//   } else {
//     // External message.
//     msg = AL.valueToCode(block, 'TEXT', AL.ORDER_NONE) || "''";
//   }

//   const functionName = AL.provideFunction_('text_prompt', `
// function ${AL.FUNCTION_NAME_PLACEHOLDER_}(msg)
//   io.write(msg)
//   io.flush()
//   return io.read()
// end
// `);
//   let code = functionName + '(' + msg + ')';

//   const toNumber = block.getFieldValue('TYPE') === 'NUMBER';
//   if (toNumber) {
//     code = 'tonumber(' + code + ', 10)';
//   }
//   return [code, AL.ORDER_HIGH];
// };

// AL['text_prompt'] = AL['text_prompt_ext'];

// AL['text_count'] = function(block) {
//   const text = AL.valueToCode(block, 'TEXT', AL.ORDER_NONE) || "''";
//   const sub = AL.valueToCode(block, 'SUB', AL.ORDER_NONE) || "''";
//   const code = functionName + '(' + text + ', ' + sub + ')';
//   return [code, AL.ORDER_HIGH];
// };

// AL['text_replace'] = function(block) {
//   const text = AL.valueToCode(block, 'TEXT', AL.ORDER_NONE) || "''";
//   const from = AL.valueToCode(block, 'FROM', AL.ORDER_NONE) || "''";
//   const to = AL.valueToCode(block, 'TO', AL.ORDER_NONE) || "''";
//   const code = functionName + '(' + text + ', ' + from + ', ' + to + ')';
//   return [code, AL.ORDER_HIGH];
// };
