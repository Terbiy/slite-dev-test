'use strict'

const net = require('net')
const { host, port } = require('../config.json')
const {
  parseCommand,
  parseCreation,
  parseInsertion,
  parseDeletion,
  parseGetting
} = require('./query-parser.js')

const server = net.createServer(connection => {
  connection.setEncoding('utf8')

  connection.on('data', query => {
    const response = handleIncommingQuery(query)

    connection.write(response)
    connection.write('\r\n')
  })

  connection.pipe(connection)
})

server.listen(port, host)

function handleIncommingQuery(query) {
  const command = parseCommand(query)

  const handle =
    {
      create,
      insert,
      delete: deleteDocument,
      get
    }[command] || (() => `No command ${command} found.`)

  return handle(query)
}

function create(query) {
  const settings = parseCreation(query)

  console.log(query, settings)

  return 'creating'
}

function insert(query) {
  const settings = parseInsertion(query)

  console.log(query, settings)

  return 'inserting'
}

function deleteDocument(query) {
  const settings = parseDeletion(query)

  console.log(query, settings)

  return 'deleting'
}

function get(query) {
  const settings = parseGetting(query)

  console.log(query, settings)

  return 'getting'
}
