import deepmerge from 'deepmerge'
import loglevel from 'loglevel'

const log = loglevel.getLogger('http-helpers')

let apiKey = 'torus-default'

export const gatewayAuthHeader = 'x-api-key'
export function setAPIKey(a) {
  apiKey = a
}

export function clearAPIKey() {
  apiKey = 'torus-default'
}

export function getAPIKey() {
  return apiKey
}

export const promiseTimeout = (ms, promise) => {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(`Timed out in ${ms}ms`))
    }, ms)
  })
  return Promise.race([promise, timeout])
}

export const post = (url, data = {}, options_ = {}, useAPIKey = false) => {
  const defaultOptions = {
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: options_.isUrlEncodedData ? data : JSON.stringify(data),
  }
  if (useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, [gatewayAuthHeader]: getAPIKey() }
  }
  const options = deepmerge.all([defaultOptions, options_, { method: 'POST' }])
  return promiseTimeout(
    30000,
    fetch(url, options).then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw response
    })
  )
}

export const remove = (url, _data = {}, options_ = {}, useAPIKey = false) => {
  const defaultOptions = {
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  }
  if (useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, [gatewayAuthHeader]: getAPIKey() }
  }
  const options = deepmerge.all([defaultOptions, options_, { method: 'DELETE' }])
  return fetch(url, options).then((response) => {
    if (response.ok) {
      return response.json()
    }
    throw response
  })
}

export const get = (url, options_ = {}, useAPIKey = false) => {
  const defaultOptions = {
    mode: 'cors',
    cache: 'no-cache',
    headers: {},
  }
  if (useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, [gatewayAuthHeader]: getAPIKey() }
  }
  const options = deepmerge.all([defaultOptions, options_, { method: 'GET' }])
  return fetch(url, options).then((response) => {
    if (response.ok) {
      return response.json()
    }
    throw response
  })
}

export const patch = (url, data = {}, options_ = {}, useAPIKey = false) => {
  const defaultOptions = {
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  }
  if (useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, [gatewayAuthHeader]: getAPIKey() }
  }
  const options = deepmerge.all([defaultOptions, options_, { method: 'PATCH' }])
  return fetch(url, options).then((response) => {
    if (response.ok) {
      return response.json()
    }
    throw response
  })
}

export const generateJsonRPCObject = (method, parameters) => ({
  jsonrpc: '2.0',
  method,
  id: 10,
  params: parameters,
})

export const promiseRace = (url, options, timeout) => {
  log.info('promise race', url)
  return Promise.race([
    get(url, options),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('timeout'))
      }, timeout)
    }),
  ])
}
