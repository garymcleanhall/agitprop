'use strict'

const request = require('request-promise')

function _link(relationship, uri, method = 'GET', predicate) {
  return predicate ? {
    rel: relationship,
    uri: _uriInterceptor(uri),
    method
  } : null
}

function _links(...links) {
  return links
    .filter(link => !!link)
    .reduce((accumulator, current) => {
      accumulator[current.rel] = { uri: current.uri, method: current.method }
      return accumulator
    }, {})
}

async function _rest(uri,...relations)  {
  let auth = null
  if(uri.hasOwnProperty('auth')) {
    auth = uri.auth
  }
  return await _next(await _request(uri), relations, auth)
}

async function _follow(response, ...relations) {
  return await _next(response, relations)
}

async function _request(opts) {
  let options = { simple: false, resolveWithFullResponse: true, json: true }
  if(typeof(opts) === 'string') {
    options.uri = opts
  } else {
    options = Object.assign(opts, options)
  }
  return await request(options)
}

async function _next(response, [current, ...next], auth = null) {
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
  let uri = matchingLink.uri
  if(payload) {
    uri = _transformUri(uri, payload.__template)
  }
  if(matchingLink.method === 'GET') {
    return await _next(await _request({
      uri,
      auth
    }), next, auth)
  } else {
    delete payload.__template
    return await _next(await _request({
      uri: uri,
      method: matchingLink.method,
      json: true,
      body: payload,
      auth
    }), next, auth)
  }
}

function _transformUri(uri, parameters) {
  if(parameters === null || parameters === undefined) {
    return uri
  }
  const transformed = Object.keys(parameters).reduce((accumulator, current) => {
    return accumulator.replace(`:${current}`, parameters[current])
  }, uri)
  return transformed
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
  follow: _follow,
  setUriInterceptor: _setUriInterceptor
}