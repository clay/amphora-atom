# Amphora-Atom

[![CircleCI](https://circleci.com/gh/clay/amphora-atom/tree/master.svg?style=svg)](https://circleci.com/gh/clay/amphora-atom/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/clay/amphora-atom/badge.svg?branch=master)](https://coveralls.io/github/clay/amphora-atom?branch=master)

> A XML+ATOM renderer for feeds components.

```bash
.
├── README.md                 <-- This instructions file
├── lib
|     ├──  log.js             <-- Initialize logger
|
├── test
|   ├── index.js              <-- Setup test
|
├── index.js                  <-- File that manage the data into XML+ATOM format
├── index.test.js             <-- Test file for index.js
```

## Setup process

### Install

```bash
npm install --save amphora-atom
```

Then pass the module into the Amphora as an item for the `renderers` object property:

```bash
amphora({
  ...
  renderers: {
    ...
    require('amphora-atom'),
    ...
  },
  ...
})
```

### Use Case
The primary use case for this renderer is when you want to use component instances to generate ATOM feeds.

## How To

This renderer is highly dependent on the component API provided by Amphora and therefore relies on a component that can generate a feed of documents to be passed off to the renderer.

### Run Tests

```bash
npm test
```

