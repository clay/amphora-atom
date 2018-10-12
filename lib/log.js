'use strict';

const clayLog = require('clay-log'),
  pkg = require('../package.json');
let amphoraAtomLogInstance;

/**
 * Initialize the logger
 */
function init() {
  if (amphoraAtomLogInstance) {
    return;
  }

  // Initialize the logger
  clayLog.init({
    name: 'amphora-atom',
    prettyPrint: true,
    meta: { amphoraAtomVersion: pkg.version }
  });

  // Store the instance
  amphoraAtomLogInstance = clayLog.getLogger();
}

/**
 * Setup new logger for a file
 *
 * @param  {Object} meta
 * @return {Function}
 */
function setup(meta = {}) {
  return clayLog.meta(meta, amphoraAtomLogInstance);
}

/**
 * Set the logger instance
 * @param {Object|Function} replacement
 */
function setLogger(replacement) {
  amphoraAtomLogInstance = replacement;
}

// Setup on first require
init();

module.exports.init = init;
module.exports.setup = setup;
module.exports.setLogger = setLogger;
