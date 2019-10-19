'use strict'

const {
  separator,
  defaultContentType
} = require('../config.json').queriesSettings

module.exports = {
  parseCommand,
  parseCreation,
  parseInsertion,
  parseRemovement,
  parseGetting
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

  let position = parseInt(positionOrText, 10)
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
