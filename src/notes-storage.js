'use strict'

const httpCodes = require('./http-codes.json')

module.exports = {
  create,
  insert,
  remove,
  get
}

/**
 * The case involved here is a simple case, where I use synchronous storage.
 * Most of the time, one is asynchronous. Due to this reason, I decided to make
 * the API of the current look like an asynchronous one.
 */
const storage = new Map()

function create({ id } = {}) {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(buildError(httpCodes.notAcceptable))
    }

    if (storage.has(id)) {
      reject(buildError(httpCodes.locked))
    }

    const note = buildNote(id)

    storage.set(id, note)

    resolve({
      responseCode: httpCodes.ok,
      note
    })
  })
}

function insert() {}

function remove() {}

function get() {}

function buildNote(id) {
  return {
    id,
    text: ''
  }
}

function buildError(responseCode) {
  return {
    responseCode
  }
}
