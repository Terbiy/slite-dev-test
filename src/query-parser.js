'use strict'

const { separator } = require('../config.json').queriesSettings
const { defaultContentType } = require('../config.json').notesSettings
const { parseDecimalInt } = require('./utils.js')

module.exports = {
  parseCommand,
  parseCreation,
  parseInsertion,
  parseRemovement,
  parseGetting,
  parseFormatting
}

function parseCommand(query) {
  const [command = ''] = decomposeQuery(query)

  return command
}

function parseCreation(query) {
  return extractId(query)
}

function parseInsertion(query) {
  const [, id = '', positionOrText = '', textCandidate = ''] = decomposeQuery(
    query
  )

  let position = parseDecimalInt(positionOrText)
  let text = textCandidate

  if (!textCandidate || Number.isNaN(position)) {
    position = Number.MAX_SAFE_INTEGER
  }

  if (!textCandidate) {
    text = positionOrText
  }

  return {
    id,
    position,
    text
  }
}

function parseRemovement(query) {
  return extractId(query)
}

function parseGetting(query) {
  const [, id = '', contentType = defaultContentType] = decomposeQuery(query)

  return {
    id,
    contentType
  }
}

function parseFormatting(query) {
  const [, id = '', start, end, style = ''] = decomposeQuery(query)

  return {
    id,
    start: parseDecimalInt(start) || 0,
    end: parseDecimalInt(end) || 0,
    style
  }
}

function extractId(query) {
  const [, id = ''] = decomposeQuery(query)

  return {
    id
  }
}

function decomposeQuery(query = '') {
  return removeLastLineBreak(query).split(separator)
}

function removeLastLineBreak(query) {
  return query.replace(/\n$/, '')
}
