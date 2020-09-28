const { promisify } = require('util')
const request = require('request')
const InternalError = require('../errors/InternalError')

const requestPromisified = promisify(request)
const defRequestOptions = { qs: {}, headers: {} }

/**
 * @param {Object} context context
 * @param {Object} options request options
 * @returns {Promise<{Object}>}
 */
module.exports = async (context, options = defRequestOptions) => {
  const { baseUrl, apiKey } = context.config

  if (!baseUrl || !apiKey) {
    context.log.warn('Bazaarvoice is called without API config')
    return null
  }

  const requestOptions = {
    baseUrl,
    json: true,
    ...options,
    qs: {
      apiversion: '5.4',
      passkey: apiKey,
      ...options.qs
    }
  }

  let response
  try {
    response = await requestPromisified(requestOptions)
  } catch (err) {
    context.log.warn(err, 'API error')
    throw new InternalError(`API error: ${err}`)
  }

  const { statusCode, body, headers } = response

  const {
    'x-bazaarvoice-qpm-allotted': quota,
    'x-bazaarvoice-qpm-current': quotaCurr
  } = headers

  if (quota && quotaCurr) {
    const quotaUsage = Math.round(quotaCurr / quota) * 100 // %
    if (quotaUsage > 50) {
      context.log.info({ quota, quotaCurr, quotaUsage }, 'Bazaarvoice quota')
    }
  }

  if (statusCode !== 200) {
    context.log.warn({ statusCode, body }, 'API error')
    throw new InternalError(`API error: ${statusCode}`)
  }

  return body
}
