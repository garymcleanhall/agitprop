'use strict'

const request = require('request-promise')

function _link(relationship, uri, method = 'GET') {
  return {
    rel: relationship,
    uri,
    method
  }
}

function _links(...links) {
  return links.reduce((accumulator, current) => {
    accumulator[current.rel] = { uri: current.uri, method: current.method }
    return accumulator
  }, {})
}

async function _rest(uri,...relations)  {
  return await _next(await _request(uri), relations)
}

async function _request(opts) {
  let options = { simple: false, resolveWithFullResponse: true, json: true }
  if(typeof(opts) === 'string') {
    options.uri = opts
  } else {
    options = Object.assign(opts, options)
  }
  options.uri = _uriInterceptor(options.uri)
  return await request(options)
}

async function _next(response, [current, ...next]) {
  if(current === undefined) {
    return response
  }
  let relationship = null
  let payload = null
  if(current instanceof Object) {
    relationship = Object.keys(current)[0]
    payload = current[relationship]
  } else {
    relationship = current
  }
  const matchingLink = response.body.links[relationship]
  if(!matchingLink) {
    throw `Link not found: '${relationship}' - ${JSON.stringify(response.body)}`
  }
  if(matchingLink.method === 'GET') {
    return await _next(await _request(matchingLink.uri), next)
  } else {
    return await _next(await _request({
      uri: matchingLink.uri,
      method: matchingLink.method,
      json: true,
      body: payload
    }), next)
  }
}

let _uriInterceptor = function(uri) {
  return uri
}

function _setUriInterceptor(interceptor) {
  _uriInterceptor = interceptor
}

module.exports = {
  link: _link,
  links: _links,
  rest: _rest,
  setUriInterceptor: _setUriInterceptor
}