'use strict'

const httpCodes = require('./http-codes.json')

module.exports = {
  create,
  insert,
  remove,
  get,
  clear
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

function insert({ id, position = Number.MAX_SAFE_INTEGER, text } = {}) {
  return new Promise((resolve, reject) => {
    if (!(id && text)) {
      reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      reject(buildError(httpCodes.notFound))
    }

    const note = storage.get(id)
    const { text: originalText } = note

    const relevantPosition = Math.min(position, originalText.length)

    note.text =
      originalText.slice(0, relevantPosition) +
      text +
      originalText.slice(relevantPosition)

    resolve({
      responseCode: httpCodes.ok
    })
  })
}

function remove({ id } = {}) {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      reject(buildError(httpCodes.notFound))
    }

    storage.delete(id)

    resolve({
      responseCode: httpCodes.ok
    })
  })
}

function get({ id, contentType } = {}) {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      reject(buildError(httpCodes.notFound))
    }

    const note = storage.get(id)

    resolve({
      responseCode: httpCodes.ok,
      note
    })
  })
}

function clear() {
  storage.clear()
}

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
