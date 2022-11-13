/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating AL for dynamic variable blocks.
 */
'use strict';

goog.module('Blockly.AL.variablesDynamic');

const {alGenerator: AL} = goog.require('Blockly.AL');
/** @suppress {extraRequire} */
goog.require('Blockly.AL.variables');


// AL is dynamically typed.
AL['variables_get_dynamic'] = AL['variables_get'];
AL['variables_set_dynamic'] = AL['variables_set'];
