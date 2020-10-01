const { wrap } = require('../lib/cache')
const callApi = require('../api/callApi')

/**
 * Get reviews statistic for given product IDs
 * @param {Object} context
 * @param {String[]} productIds
 * @returns {Promise<{Object[]}>}
 */
module.exports = async (context, productIds) => {
  const ratings = await wrap(context, productIds, async (missingProductIds) => {
    const initial = missingProductIds.reduce((acc, prodId) => {
      acc[prodId] = {
        count: 0,
        average: 0,
        reviewCount: 0
      }
      return acc
    }, {})

    try {
      const response = await callApi(context, {
        uri: '/data/statistics.json',
        qs: {
          filter: `ProductId:${missingProductIds.map(encodeURIComponent).join(',')}`,
          stats: 'Reviews'
        }
      })
      if (response) {
        const { Results } = response
        if (Results.length) {
          return Results.reduce((acc, result) => {
            acc[result.ProductStatistics.ProductId] = {
              count: result.ProductStatistics.ReviewStatistics.TotalReviewCount || 0,
              average: Math.round(result.ProductStatistics.ReviewStatistics.AverageOverallRating * 20),
              reviewCount: result.ProductStatistics.ReviewStatistics.TotalReviewCount
            }
            return acc
          }, initial)
        }
      }
    } catch (ignore) { /* Already logged */ }

    return initial
  })

  return {
    ratings
  }
}
