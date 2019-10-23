'use strict'

const {
  defaultContentType,
  availableStyles
} = require('../config.json').notesSettings
const httpCodes = require('./http-codes.json')
const { getNumberInInterval } = require('./utils.js')
const { SegmentsList } = require('./segments-list.js')

module.exports = {
  create,
  insert,
  remove,
  get,
  format,
  clear,
  populateStyles
}

/**
 * The case involved here is a simple case, where I use synchronous storage.
 * Most of the time, one is asynchronous. Due to this reason, I decided to make
 * the API of the current look like an asynchronous one.
 */
const storage = new Map()

const stylesSymbols = {
  bold: '**',
  italic: '*'
}

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

function get({ id, contentType = defaultContentType } = {}) {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    if (!storage.has(id)) {
      return reject(buildError(httpCodes.notFound))
    }

    resolve({
      responseCode: httpCodes.ok,
      note: prepareNote(id, contentType)
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
  return noteData.text
}

function prepareMd(noteData) {
  let { text } = noteData

  noteData.styles.forEach((style, name) => {
    const styleSymbol = stylesSymbols[name]

    text = style.reduce((text, segment) => {
      const { start, end } = segment

      return (
        text.slice(0, start) +
        styleSymbol +
        text.slice(start, end) +
        styleSymbol +
        text.slice(end)
      )
    }, text)
  })

  return text
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

    const { length } = storage.get(id).text
    const relevantStart = getNumberInInterval(start, 0, length)
    const relevantEnd = getNumberInInterval(end, 0, length)

    if (relevantStart >= relevantEnd) {
      return reject(buildError(httpCodes.notAcceptable))
    }

    storage
      .get(id)
      .styles.get(style)
      .addSegment(relevantStart, relevantEnd)

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
  const styles = populateStyles()

  return {
    id,
    text: '',
    styles
  }
}

function populateStyles() {
  return Object.keys(availableStyles).reduce((accumulated, style) => {
    accumulated.set(style, new SegmentsList())

    return accumulated
  }, new Map())
}

function buildError(responseCode) {
  return {
    responseCode
  }
}
