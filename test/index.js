'use strict';

const glob = require('glob'),
  _each = require('lodash/each'),
  chai = require('chai'),
  path = require('path'),
  tests = glob.sync([__dirname, '..', 'lib', '**', '*.test.js'].join(path.sep));

// defaults for chai
chai.config.showDiff = true;
chai.config.truncateThreshold = 0;

// Right now we only have the index file
require('../index.test.js');

_each(tests, function (test) {
  require(test);
});
