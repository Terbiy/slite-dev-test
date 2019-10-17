'use strict'

// Your code goes here
const net = require('net')
const { host, port } = require('../config.json')

const server = net.createServer(connection => {
  console.log('Client connected')

  connection.on('end', () => {
    console.log('client disconnected')
  })

  connection.write('Hello\r\n')

  connection.pipe(connection)
})

server.listen(port, host)
