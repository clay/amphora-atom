'use strict';

const sinon = require('sinon'),
  { expect } = require('chai'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname, function () {
  describe(filename, function () {
    var sandbox, logSpy;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      logSpy = sandbox.spy();

      lib.setLog(logSpy);
    });

    afterEach(function () {
      sandbox.restore();
    });

    function makeFakeRes() {
      return {
        type: sandbox.spy(),
        send: sandbox.spy(),
        status: sandbox.spy(),
        json: sandbox.spy()
      };
    }

    describe('render', function () {
      const fn = lib[this.title];

      it('returns an object with `output` and `type` properties', function () {
        const fakeRes = {
            type: sandbox.spy(),
            send: sandbox.spy()
          },
          result = fn({
            feed: [],
            meta: {
              title: 'foo',
              description: 'bar',
              link: 'foobar'
            }
          }, {}, fakeRes);

        return result.then(function () {
          sinon.assert.calledWith(fakeRes.type, 'application/atom+xml');
          sinon.assert.calledOnce(fakeRes.send);
        });
      });

      it('works', function () {
        const res = makeFakeRes(),
          result = fn({
            feed: [],
            meta: {}
          }, {}, res);

        result.then(function () {
          sinon.assert.calledWith(res.json, {status: 500, message: 'No data send to XML renderer, cannot respond'});
        });
      });
    });

    describe('wrapInEntry', function () {
      const fn = lib[this.title];

      it('returns a passed in value as the value for an `entry` property', function () {
        sinon.assert.match(fn('foo'), { entry: 'foo' });
      });
    });

    describe('wrapInTopLevel', function () {
      const fn = lib[this.title],
        result = fn('foo'),
        defaultNamespaces = {
          xmlns: 'http://www.w3.org/2005/Atom',
          'xmlns:media': '"http://search.yahoo.com/mrss/',
          'xmlns:mi': 'http://schemas.ingestion.microsoft.com/common/',
          'xmlns:dcterms': 'https://purl.org/dc/terms/',
          'xmlns:at': 'http://purl.org/atompub/tombstones/1.0',
          'xml:lang': 'en-us'
        };

      it('wraps the passed in value in an object with and atom array', function () {
        expect(Array.isArray(result)).to.be.true;
      });

      it('has an object with an `_attr` property as the first object of the `feed` Array', function () {
        expect(result[0].feed[0]._attr).to.not.be.undefined;
      });

      it('default _attr properties are the atom ones', function () {
        expect(result[0].feed[0]._attr).to.eql(defaultNamespaces);
      });

      it('has an object with a `feed` property as the first element in the atom array', function () {
        expect(result[0].feed).to.not.be.undefined;
      });
    });

    describe('feedMetaTags', function () {
      const fn = lib[this.title];

      it('returns a function', function () {
        const result = fn({title:'foo', description: 'bar', link: 'foobar'});

        expect(result).to.be.an('function');
      });

      it('its callback returns an array', function () {
        const result = fn({title:'foo', description: 'bar', link: 'foobar'});

        expect(result([])).to.be.an('array');
      });

      it('its callback assigns passed in values to the return array', function () {
        const [ entryId, entryTitle, entrySubtitle, , , entryRights, entryGenerator ] =
          fn({title:'foo', description: 'bar', link: 'foobar', copyright: '2018', generator: 'Feed delivered by Clay'})([]);

        expect(entryId.id).to.eql('foobar');
        expect(entryTitle.title).to.eql('foo');
        expect(entrySubtitle.subtitle).to.eql('bar');
        expect(entryRights.rights).to.eql('2018');
        expect(entryGenerator.generator).to.eql('Feed delivered by Clay');
      });

      it('accepts an `opt` object with additional meta tags', function () {
        const language = {language: 'en-US'},
          result = fn({title:'foo', description: 'bar', link: 'foobar', opt: language})([]);

        expect(result).have.to.deep.include(language);
      });
    });
  });
});
