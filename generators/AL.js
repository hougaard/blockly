/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper functions for generating AL for blocks.
 * Based on Ellen Spertus's blocky-AL project.
 * @suppress {checkTypes|globalThis}
 */
'use strict';

goog.module('Blockly.AL');

const objectUtils = goog.require('Blockly.utils.object');
const stringUtils = goog.require('Blockly.utils.string');
const {Block} = goog.requireType('Blockly.Block');
const {Generator} = goog.require('Blockly.Generator');
const {inputTypes} = goog.require('Blockly.inputTypes');
const {Names} = goog.require('Blockly.Names');
const {Workspace} = goog.requireType('Blockly.Workspace');


/**
 * AL code generator.
 * @type {!Generator}
 */
const AL = new Generator('AL');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 */
AL.addReservedWords(
    'error,trigger,message,' +
    'and,break,do,else,end,false,for,procedure,if,in,local,nil,not,or,' +
    'repeat,exit,then,true,until,while');

/**
 * Order of operation ENUMs.
 * http://www.AL.org/manual/5.3/manual.html#3.4.8
 */
AL.ORDER_ATOMIC = 0;  // literals
// The next level was not explicit in documentation and inferred by Ellen.
AL.ORDER_HIGH = 1;            // Function calls, tables[]
AL.ORDER_EXPONENTIATION = 2;  // ^
AL.ORDER_UNARY = 3;           // not # - ~
AL.ORDER_MULTIPLICATIVE = 4;  // * / %
AL.ORDER_ADDITIVE = 5;        // + -
AL.ORDER_CONCATENATION = 6;   // ..
AL.ORDER_RELATIONAL = 7;      // < > <=  >= ~= ==
AL.ORDER_AND = 8;             // and
AL.ORDER_OR = 9;              // or
AL.ORDER_NONE = 99;

/**
 * Whether the init method has been called.
 * @type {?boolean}
 */
AL.isInitialized = false;

/**
 * Initialise the database of variable names.
 * @param {!Workspace} workspace Workspace to generate code from.
 */
AL.init = function(workspace) {
  // Call Blockly.Generator's init.
  Object.getPrototypeOf(this).init.call(this);

  if (!this.nameDB_) {
    this.nameDB_ = new Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }
  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.nameDB_.populateVariables(workspace);
  this.nameDB_.populateProcedures(workspace);

  this.isInitialized = true;
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
AL.finish = function(code) {
  // Convert the definitions dictionary into a list.
  const definitions = objectUtils.values(this.definitions_);
  // Call Blockly.Generator's finish.
  code = Object.getPrototypeOf(this).finish.call(this, code);
  this.isInitialized = false;

  this.nameDB_.reset();
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything. In AL, an expression is not a legal statement, so we must assign
 * the value to the (conventionally ignored) _.
 * http://AL-users.org/wiki/ExpressionsAsStatements
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
AL.scrubNakedValue = function(line) {
  return '/*\n' + line + '\n*/\n';
};

/**
 * Encode a string as a properly escaped AL string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} AL string.
 * @protected
 */
AL.quote_ = function(string) {
  string = string.replace(/'/g, '\'\'');
  return '\'' + string + '\'';
};

/**
 * Encode a string as a properly escaped multiline AL string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} AL string.
 * @protected
 */
AL.multiline_quote_ = function(string) {
  const lines = string.split(/\n/g).map(this.quote_);
  // Join with the following, plus a newline:
  // .. '\n' ..
  return lines.join('ERROR!'); //  [+ \'\\n\' +\n]
};

/**
 * Common tasks for generating AL from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Block} block The current block.
 * @param {string} code The AL code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} AL code with comments and subsequent blocks added.
 * @protected
 */
AL.scrub_ = function(block, code, opt_thisOnly) {
  let commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    let comment = block.getCommentText();
    if (comment) {
      comment = stringUtils.wrap(comment, this.COMMENT_WRAP - 3);
      commentCode += this.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (let i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type === inputTypes.VALUE) {
        const childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = this.allNestedComments(childBlock);
          if (comment) {
            commentCode += this.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = opt_thisOnly ? '' : this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

exports.alGenerator = AL;
