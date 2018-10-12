'use strict';

const sinon = require('sinon'),
  { expect } = require('chai'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  clayLog = require('clay-log');

describe(dirname, function () {
  describe(filename, function () {
    let sandbox, fakeLog;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      fakeLog = sandbox.stub();
      sandbox.stub(clayLog);
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('init', function () {
      const fn = lib[this.title];

      it('returns if a log instance is set', function () {
        lib.setLogger(fakeLog);
        fn();
        sinon.assert.notCalled(clayLog.init);
      });
    });

    describe('setup', function () {
      const fn = lib[this.title];

      it('should let set custom meta for clay log', function () {
        const newLog = fn({ someKey: 'someValue' });

        sinon.assert.calledOnce(clayLog.meta);
        expect(newLog).to.not.eq(lib);
      });
    });

    describe('setLogger', function () {
      const fn = lib[this.title];

      it('should let set a logger', function () {
        fn(null);
        lib.init();

        sinon.assert.calledOnce(clayLog.getLogger);
      });
    });
  });
});
