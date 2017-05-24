'use strict'

const { rest } = require('../')
const service = require('./service')
const HttpStatus = require('http-status')
const uuid = require('uuid')

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
    await service.stop()

    expect(response.statusCode).toEqual(HttpStatus.OK)
    expect(response.body).toEqual({ foo: 'bar' })
  }))

  it('allows post-ing to link', testAsync(async () => {
    await service.start()
    const requestBody = { myData: uuid() }
    const response = await rest('http://localhost:3333/', 'go:here', {'then:post': requestBody })
    await service.stop()

    expect(response.statusCode).toEqual(HttpStatus.OK)
    expect(response.body).toEqual({ request: requestBody })
  }))

})