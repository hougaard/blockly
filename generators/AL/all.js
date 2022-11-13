/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Complete helper functions for generating AL for
 *     blocks.  This is the entrypoint for AL_compressed.js.
 * @suppress {extraRequire}
 */
'use strict';

goog.module('Blockly.AL.all');

const moduleExports = goog.require('Blockly.AL');
//goog.require('Blockly.AL.colour');
//goog.require('Blockly.AL.lists');
goog.require('Blockly.AL.logic');
goog.require('Blockly.AL.loops');
goog.require('Blockly.AL.math');
goog.require('Blockly.AL.procedures');
goog.require('Blockly.AL.texts');
goog.require('Blockly.AL.variables');
goog.require('Blockly.AL.variablesDynamic');

exports = moduleExports;
