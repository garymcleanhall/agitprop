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

async function _request(uri) {
  return await request(uri, { simple: false, resolveWithFullResponse: true, json: true })
}

async function _next(response, [current, ...next]) {
  if(!current) {
    return response
  }
  const matchingLink = response.body.links[current]
  if(!matchingLink) {
    throw `Link not found: '${current}' - ${JSON.stringify(response.body)}`
  }
  return await _next(await _request(matchingLink.uri), next)
}

module.exports = {
  link: _link,
  links: _links,
  rest: _rest
}