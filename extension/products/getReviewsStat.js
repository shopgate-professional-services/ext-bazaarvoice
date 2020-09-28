const LRU = require('lru-cache')
const callApi = require('../api/callApi')

const lruCache = new LRU({
  max: 1000,
  maxAge: 6e5 // 10 minutes,
})

/**
 * Get reviews statistic for given product IDs
 * @param {Object} context
 * @param {String[]} productIds
 * @returns {Promise<{Object[]}>}
 */
module.exports = async (context, productIds) => {
  const notInCache = productIds.filter(productId => !lruCache.has(productId))

  if (notInCache.length) {
    try {
      const response = await callApi(context, {
        uri: '/data/statistics.json',
        qs: {
          filter: `ProductId:${notInCache.map(encodeURIComponent).join(',')}`,
          stats: 'Reviews'
        }
      })
      if (response) {
        const { Results } = response
        if (Results.length) {
          Results.forEach(result => {
            if (productIds.includes(result.ProductStatistics.ProductId)) {
              lruCache.set(result.ProductStatistics.ProductId, {
                count: result.ProductStatistics.ReviewStatistics.TotalReviewCount || 0,
                average: Math.round(result.ProductStatistics.ReviewStatistics.AverageOverallRating * 20),
                reviewCount: result.ProductStatistics.ReviewStatistics.TotalReviewCount
              })
            }
          })
        }
      }
    } catch (ignore) { /* Already logged */ }
  }

  const ratings = productIds
    .reduce((acc, productId) => {
      acc[productId] = lruCache.get(productId)
      return acc
    }, {})

  return {
    ratings
  }
}
