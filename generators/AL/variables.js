/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating AL for variable blocks.
 */
'use strict';

goog.module('Blockly.AL.variables');

const {NameType} = goog.require('Blockly.Names');
const {alGenerator: AL} = goog.require('Blockly.AL');


AL['variables_get'] = function(block) {
  // Variable getter.
  const code =
      AL.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, AL.ORDER_ATOMIC];
};

AL['variables_set'] = function(block) {
  // Variable setter.
  const argument0 = AL.valueToCode(block, 'VALUE', AL.ORDER_NONE) || '0';
  const varName =
      AL.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' := ' + argument0 + '\n';
};
