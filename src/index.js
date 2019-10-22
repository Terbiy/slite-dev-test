'use strict'

const net = require('net')
const { host, port } = require('../config.json')
const {
  parseCommand,
  parseCreation,
  parseInsertion,
  parseRemovement,
  parseGetting,
  parseFormatting
} = require('./query-parser.js')
const notesStorage = require('./notes-storage.js')
const httpCodes = require('./http-codes.json')

const server = net.createServer(connection => {
  connection.setEncoding('utf8')

  const writeResponseValueOrCode = setConnectionAndWriteResponseValueOrCode(
    connection
  )
  connection.on('data', query => {
    handleIncommingQuery(query)
      .then(writeResponseValueOrCode)
      .catch(writeResponseValueOrCode)
  })
})

server.listen(port, host)

function handleIncommingQuery(query) {
  const command = parseCommand(query)

  const handle =
    {
      create,
      insert,
      delete: remove,
      get,
      format
    }[command] ||
    (() => Promise.reject({ responseCode: httpCodes.methodNotAllowed }))

  return handle(query)
}

function create(query) {
  const settings = parseCreation(query)

  return notesStorage.create(settings)
}

function insert(query) {
  const settings = parseInsertion(query)

  return notesStorage.insert(settings)
}

function remove(query) {
  const settings = parseRemovement(query)

  return notesStorage.remove(settings)
}

function get(query) {
  const settings = parseGetting(query)

  return notesStorage.get(settings).then(response => {
    return {
      responseValue: response.note.text
    }
  })
}

function format(query) {
  const settings = parseFormatting(query)

  return notesStorage.format(settings)
}

function setConnectionAndWriteResponseValueOrCode(connection) {
  return function({ responseValue, responseCode }) {
    connection.write(`${responseCode || responseValue}\r\n`)
  }
}
