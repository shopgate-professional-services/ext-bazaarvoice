const ConnectRedisClient = require('@shopgate/connect-redis-client')

let CACHE_TTL = 3600
let redisClient = null

/**
 * @param {SDKContext} context
 * @returns {ConnectRedisClient}
 */
function getClient (context) {
  if (!redisClient) {
    CACHE_TTL = context.config.cacheTTL || CACHE_TTL
    redisClient = new ConnectRedisClient(
      `@shopgate-project/bazaarvoice-${context.config.cacheRevision}`,
      context.meta.appId,
      context.config.redisClientSecret
    )
    context.log.info(`Redis client initialized with revision [${context.config.cacheRevision || 1}] `)
  }

  return redisClient
}

/**
 * @param {SDKContext} context
 * @param {string[]} keys
 * @param {Function} retrieveCb to get real data
 * @param {number} ttl in seconds
 * @returns {Promise<*>}
 */
module.exports.wrap = async (context, keys, retrieveCb, ttl = CACHE_TTL) => {
  const redisClient = getClient(context)

  let data = await new Promise((resolve) => {
    const timedOut = setTimeout(() => {
      context.log.info({ keys }, 'Redis cache get took too long.')
      resolve(null)
    }, 200)

    const multi = redisClient.client.multi()
    keys.forEach(key => {
      multi.get(key)
    })

    multi.exec((execError, results) => {
      clearTimeout(timedOut)

      if (execError) {
        context.log.error({
          redisError: execError,
          keys
        }, 'Redis cache get exec error')
        resolve({})
      }

      const notEmpty = keys.reduce((acc, key, idx) => {
        if (results[idx]) {
          acc[key] = JSON.parse(results[idx])
        }
        return acc
      }, {})

      resolve(notEmpty)
    })
  })

  const existKeys = Object.keys(data)
  const missingKeys = keys.filter(k => !existKeys.includes(k))

  if (missingKeys.length) {
    context.log.debug({ keys: missingKeys }, 'Cache keys miss')
    const missingData = (await retrieveCb(missingKeys))
    if (missingData) {
      const multi = redisClient.client.multi()
      Object.keys(missingData).forEach(k => {
        multi.set(k, JSON.stringify(missingData[k]), 'EX', ttl)
      })

      multi.exec((execError) => {
        if (execError) {
          context.log.error({
            redisError: execError,
            keys: missingKeys
          }, 'Redis cache set exec error')
        }
      })

      data = {
        ...data,
        ...missingData
      }
    }
  } else {
    context.log.debug({ keys }, 'Cache keys hit')
  }

  return data
}

/** @type {ConnectRedisClient} */
module.exports.cache = redisClient
