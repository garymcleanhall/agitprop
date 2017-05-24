'use strict'

const express = require('express')
const { links, link } = require('../')
const uuid = require('uuid')

const app = express()

const uris = {
  a: `/${uuid()}`,
  b: `/${uuid()}`
}

app.get('/', (request, response) => {
  response
    .status(200)
    .json({
      links: links(
        link('self', 'http://localhost:3333/'),
        link('go:here', 'http://localhost:3333'+uris.a)
      )
    })
})

app.get(uris.a, (request, response) => {
  response
    .status(200)
    .json({
      links: links(
        link('self', 'http://localhost:3333'+uris.a),
        link('then:here', 'http://localhost:3333'+uris.b)
      )
    })
})

app.get(uris.b, (request, response) => {
  response
    .status(200)
    .json({
      foo: 'bar'
    })
})

module.exports = {
  start: () => {
    return new Promise((resolve, reject) => {
      this.server = app.listen(3333, () => {
        console.dir('sample service listening on 3333')
        resolve()
      })
    })
  },
  stop: () => {
    this.server.close()
    return Promise.resolve()
  }
}