'use strict'

module.exports = {
  parseCommand,
  parseCreation,
  parseInsertion,
  parseDeletion,
  parseGetting
}

function parseCommand(query) {
  const [command = ''] = decomposeQuery(query)

  return command
}

function parseCreation(query = '') {
  return extractId(query)
}

function parseInsertion(query = '') {
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

function parseDeletion(query = '') {
  return extractId(query)
}

function parseGetting(query = '') {
  const [, id = '', contentType = 'txt'] = decomposeQuery(query)

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
  return removeLastLineBreak(query).split(':')
}

function removeLastLineBreak(query) {
  return query.replace(/\n$/, '')
}
