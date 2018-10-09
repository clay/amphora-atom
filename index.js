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
      { id: link },
      { title },
      { subtitle: description },
      { link: { _attr: { rel: 'self', href: link } } },
      { updated: format(now, 'YYYY-MM-DDTHH:mm:ssZ') }, // Date format must be RFC 3339 compliant
      { rights: copyright || now.getFullYear() },
      { generator: generator || 'Feed delivered by Clay' }
    ];

    if (opt) {
      siteMeta = siteMeta.concat(opt);
    }

    return siteMeta.concat(group);
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
function wrapInTopLevel(data) {
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
 * Wrap each item in an object under the `entry` property
 *
 * @param  {Object} item
 * @return {Object}
 */
function wrapInEntry(item) {
  return { entry: item };
}

function render({ feed, meta }, options, res) {
  return h(feed)
    .map(wrapInEntry)
    .collect()
    .map(feedMetaTags(meta))
    .map(data => wrapInTopLevel(data))
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
