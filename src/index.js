'use strict'

// Your code goes here
const net = require('net')
const { host, port } = require('../config.json')

const server = net.createServer(connection => {
  connection.setEncoding('utf8')

  connection.on('data', query => {
    const response = handleIncommingQuery(query)

    console.log(response)
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

  return handle()
}

function create(query) {
  return 'creating'
}

function insert(query) {
  return 'inserting'
}

function deleteDocument(query) {
  return 'deleting'
}

function get(query) {
  return 'getting'
}

function parseCommand(query) {
  const [command = ''] = query.split(':')

  return command
}
