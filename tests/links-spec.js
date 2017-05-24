'use strict'

const { links, link, setUriInterceptor } = require('../')

describe('Links', () => {
  
  it('creates link object from parameters', () => {
    const actual = link('self', '/', 'GET')
    const expected = {
      rel: 'self',
      uri: '/',
      method: 'GET'
    }
    expect(actual).toEqual(expected)
  })

  it('uses GET method by default', () => {
    const actual = link('self', '/')
    const expected = {
      rel: 'self',
      uri: '/',
      method: 'GET'
    }
  })

  it('creates links object indexed by relationship', () => {
    const actual = links(
      link('self', '/'),
      link('other', '/other'),
      link('special', '/controller', 'POST')
    )
    const expected = {
      self: {
        uri: '/',
        method: 'GET'
      },
      other: {
        uri: '/other',
        method: 'GET'
      },
      special: {
        uri: '/controller',
        method: 'POST'
      }
    }
    expect(actual).toEqual(expected)
  })

  it('allows interception of the relative uri for each link', () => {
    setUriInterceptor(uri => {
      return `hello_${uri}`
    })

    const actual = links(
      link('self', '/'),
      link('other', '/yeah_boiii')
    )

    const expected = {
      self: {
        uri: 'hello_/',
        method: 'GET'
      },
      other: {
        uri: 'hello_/yeah_boiii',
        method: 'GET'
      }
    }

    expect(actual).toEqual(expected)
  })

})