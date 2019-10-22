'use strict'

const { availableStyles } = require('../config.json').notesSettings
const httpCodes = require('./http-codes.json')
const { getNumberInInterval } = require('./utils.js')

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
      note
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

    const note = storage.get(id)
    const { text: originalText } = note

    const relevantPosition = getNumberInInterval(
      position,
      0,
      originalText.length
    )

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

function get({ id, contentType } = {}) {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      return reject(buildError(httpCodes.notFound))
    }

    const note = storage.get(id)

    resolve({
      responseCode: httpCodes.ok,
      note
    })
  })
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

    const { text } = storage.get(id)
    const relevantStart = getNumberInInterval(start, 0, text.length)
    const relevantEnd = getNumberInInterval(end, 0, text.length)

    if (relevantStart >= relevantEnd) {
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
    text: ''
  }
}

function buildError(responseCode) {
  return {
    responseCode
  }
}
