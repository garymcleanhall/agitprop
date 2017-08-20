'use strict'

const express = require('express')
const { links, link } = require('../')
const uuid = require('uuid')
const bodyParser = require('body-parser')
const auth = require('basic-auth')

const app = express()
app.use(bodyParser.json())

const uris = {
  a: `/${uuid()}`,
  b: `/${uuid()}`,
  c: `/${uuid()}`,
  d: `/${uuid()}/:name`
}

app.get('/', (request, response) => {
  response
    .status(200)
    .json({
      links: links(
        link('self', 'http://localhost:3333/'),
        link('go:here', 'http://localhost:3333'+uris.a),
        link('with:template', 'http://localhost:3333'+uris.d)
      )
    })
})

app.get(uris.a, (request, response) => {
  response
    .status(200)
    .json({
      links: links(
        link('self', 'http://localhost:3333'+uris.a),
        link('then:here', 'http://localhost:3333'+uris.b),
        link('then:post', 'http://localhost:3333'+uris.c, 'POST')
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

app.post(uris.c, (request, response) => {
  response
    .status(200)
    .json({
      request: request.body
    })
})

app.get(uris.d, (request, response) => {
  response
    .status(200)
    .json({
      name: request.params.name
    })
})

app.get('/auth', (request, response) => {
  if(auth(request)) {
    response
      .status(200)
      .json({
        links: links(
          link('self', 'http://localhost:3333/auth'),
          link('auth:here', 'http://localhost:3333/auth'+uris.a),
          link('with:template', 'http://localhost:3333/auth'+uris.d)
        )
      })
  } else {
    console.dir(auth(request))
    response
      .status(401)
      .json({})
  }
})

app.get('/auth'+uris.a, (request, response) => {
  if(auth(request)) {
    response
      .status(200)
      .json({
        links: links(
          link('self', 'http://localhost:3333'+uris.a),
          link('auth:there', 'http://localhost:3333'+uris.b),
          link('then:post', 'http://localhost:3333'+uris.c, 'POST')
        )
      })
  } else {
    console.dir(auth(request))
    response
      .status(401)
      .json({})
  }
})

app.get('/auth'+uris.d, (request, response) => {
  if(auth(request)) {
    response
      .status(200)
      .json({
        name: request.params.name
      })
  } else {
    console.dir(auth(request))
    response
      .status(401)
      .json({})
  }
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