'use strict';

const glob = require('glob'),
  _ = require('lodash'),
  chai = require('chai'),
  path = require('path'),
  tests = glob.sync([__dirname, '..', 'services', '**', '*.test.js'].join(path.sep));

// defaults for chai
chai.config.showDiff = true;
chai.config.truncateThreshold = 0;

// Right now we only have the index file
require('../index.test.js');

_.each(tests, function (test) {
  require(test);
});
