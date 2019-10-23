'use strict'

const {
  defaultContentType,
  availableStyles
} = require('../config.json').notesSettings
const httpCodes = require('./http-codes.json')
const { PartitionedTexts } = require('./partitioned-texts.js')

module.exports = {
  create,
  insert,
  remove,
  get,
  format,
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
      return reject(buildError(httpCodes.notAcceptable))
    }

    const note = buildNote(id)

    storage.set(id, note)

    resolve({
      responseCode: httpCodes.ok,
      note: prepareNote(id)
    })
  })
}

function insert({ id, position = Number.MAX_SAFE_INTEGER, text } = {}) {
  return new Promise((resolve, reject) => {
    if (!(id && text)) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      return reject(buildError(httpCodes.notFound))
    }

    storage.get(id).text.insert(text, position)

    resolve({
      responseCode: httpCodes.ok
    })
  })
}

function remove({ id } = {}) {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      return reject(buildError(httpCodes.notFound))
    }

    storage.delete(id)

    resolve({
      responseCode: httpCodes.ok
    })
  })
}

function get({ id, contentType = defaultContentType } = {}) {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      return reject(buildError(httpCodes.notFound))
    }

    const note = prepareNote(id, contentType)

    resolve({
      responseCode: httpCodes.ok,
      note
    })
  })
}

function prepareNote(id, contentType) {
  const noteData = storage.get(id)

  const prepareText =
    {
      txt: prepareTxt,
      md: prepareMd
    }[contentType] || prepareTxt

  return {
    text: prepareText(noteData, contentType)
  }
}

function prepareTxt(noteData) {
  return noteData.text.prepareTxt()
}

function prepareMd(noteData) {
  return noteData.text.prepareMd()
}

function format({ id, start, end, style }) {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      return reject(buildError(httpCodes.notFound))
    }

    if (!availableStyles.hasOwnProperty(style)) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    try {
      storage.get(id).text.format(start, end, style)
    } catch (err) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    resolve({
      responseCode: httpCodes.ok
    })
  })
}

function clear() {
  return new Promise(resolve => {
    storage.clear()

    resolve()
  })
}

function buildNote(id) {
  return {
    id,
    text: new PartitionedTexts()
  }
}

function buildError(responseCode) {
  return {
    responseCode
  }
}
