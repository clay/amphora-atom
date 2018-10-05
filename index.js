'use strict';

const h = require('highland'),
  xml = require('xml'),
  format = require('date-fns/format'),
  log = require('./lib/log').setup({ file: __filename });

/**
 * Elevate category tags into the
 * the top of the document
 *
 * @param  {Array} group
 * @return {Array}
 */
function elevateCategory(group) {
  return group
    .map(({ entry }) => {
      return entry
        .filter(entry => entry && entry.category)
        .map(entry => entry && entry.category)
        .join(',');
    })
    .filter(Boolean)
    .map(string => ({ category: string }));
}

/**
 * Remove falsy values from an object
 *
 * @param {Object} obj
 * @returns {Object}
 */
function cleanNullValues(obj) {
  for (let propName in obj) {
    if (!obj[propName]) {
      delete obj[propName];
    }
  }

  return obj;
}

/**
 * Add the meta tags around the feed
 *
 * @param  {String} title
 * @param  {String} description
 * @param  {String} link
 * @param  {String|Number} [copyright]
 * @param  {String} [generator]
 * @param  {String} [docs]
 * @param  {String} [opt]
 * @return {Array}
 */
function feedMetaTags({ title, description, link, copyright, generator, opt }) {
  return (group) => {
    let now, siteMeta;

    if (!title || !description || !link) {
      throw new Error('A `title`, `description` and `link` property are all required in the `meta` object for the Atom renderer');
    }

    now = new Date();
    siteMeta = [
      { title },
      { subtitle: description },
      { link },
      { updated: format(now, 'ddd, DD MMM YYYY HH:mm:ss ZZ') }, // Date format must be RFC 822 compliant
      { rights: copyright || now.getFullYear() },
      { generator: generator || 'Feed delivered by Clay' }
    ];

    if (opt) {
      siteMeta = siteMeta.concat(opt);
    }

    return siteMeta.concat(elevateCategory(group), group);
  };
}

/**
 * Sends error to the log service
 * @param {Object} res
 * @param {Error} e
 * @param {string} message
 */
function sendError(res, e, message = e.message) {
  const status = 500;

  res.status(status);
  res.json({ status, message });

  log('error', e.message, {
    stack: e.stack
  });
}

/**
 * Wraps content in top level RSS and Channel tags
 *
 * @param  {Array} data
 * @param  {Object} attr
 * @return {Object}
 */
function wrapInTopLevel(data, attr = {}) {
  console.log(data);
  const defaultNamespaces = {
    xmlns: 'http://www.w3.org/2005/Atom',
    'xmlns:media': '"http://search.yahoo.com/mrss/',
    'xmlns:mi': 'http://schemas.ingestion.microsoft.com/common/',
    'xmlns:dcterms': 'https://purl.org/dc/terms/',
    'xmlns:at': 'http://purl.org/atompub/tombstones/1.0',
    'xml:lang': 'en-us'
  };

  return [{
    feed: [{ _attr: { ...defaultNamespaces } }, ...data]
  }];
}

/**
 * Wrap each entry in an object under the `item` property
 *
 * @param  {Object} entry
 * @return {Object}
 */
function wrapInEntry(item) {
  return { entry: item };
}

function render({ results, meta, attr }, options, res) {
  return h(results)
    .map(wrapInEntry)
    .collect()
    .map(data => wrapInTopLevel(data, attr))
    .errors(e => sendError(res, e))
    .toPromise(Promise)
    .then(data => {
      if (!data) {
        throw new Error('No data send to XML renderer, cannot respond');
      }

      res.type('application/atom+xml');
      res.send(xml(data, { declaration: true, indent: '\t' }));
    })
    .catch(e => sendError(res, e));
}

module.exports.render = render;
