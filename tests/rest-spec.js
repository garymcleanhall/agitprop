'use strict'

let { rest, follow, setUriInterceptor } = require('../')
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

  beforeAll(() => {
    setUriInterceptor(uri => {
      return uri
    })
  }) 

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

  it('allows interception of uri', testAsync(async () => {
    await service.start()  
    let calls = 0
    const uriInterceptor = (uri) => {
      calls++
      return uri
    }
    setUriInterceptor(uriInterceptor)
    const response = await rest('http://localhost:3333/', 'go:here')
    await service.stop()

    expect(calls).toBeGreaterThan(0)
  }))

  it('transforms templated uris', testAsync(async () => {
    await service.start()
    const response = await (rest('http://localhost:3333/', { 'with:template': { __template: { name: 'Hello' }  } }))
    await service.stop()

    expect(response.statusCode).toEqual(HttpStatus.OK)
    expect(response.body).toEqual({ name: 'Hello' })
  }))

  it('allows follow-on calls given a response', testAsync(async () => {
    await service.start()
    const response = await rest('http://localhost:3333/', 'go:here')
    const nextResponse = await follow(response, 'then:here')
    await service.stop()

    expect(nextResponse.statusCode).toEqual(HttpStatus.OK)
    expect(nextResponse.body).toEqual({ foo: 'bar' })
  }))

})