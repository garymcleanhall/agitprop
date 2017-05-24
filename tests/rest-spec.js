'use strict'

const { rest } = require('../')
const service = require('./service')
const HttpStatus = require('http-status')

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, error => {
      fail(error)
      done()
    })
  }
}

describe('Rest client', () => {

  it('follows links', testAsync(async () => {

    await service.start()
    const response = await rest('http://localhost:3333/', 'go:here', 'then:here')
    expect(response.statusCode).toEqual(HttpStatus.OK)
    expect(response.body).toEqual({ foo: 'bar' })
    await service.stop()

  }))

})