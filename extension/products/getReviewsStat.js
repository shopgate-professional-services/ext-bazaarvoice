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
    const { reviewsStatFilterFields, languageId, ratingRoundingStep } = context.config

    const roundFractions = 1.0 / ratingRoundingStep
    const normalizeRating = (rating) => Math.round(rating * 20 * roundFractions) / roundFractions

    // Convert de-de into de_DE
    const loc = `${languageId.substring(0, 2)}_${languageId.substring(3, 5).toUpperCase()}`

    const initial = missingProductIds.reduce((acc, prodId) => {
      acc[prodId] = {
        count: 0,
        average: 0,
        reviewCount: 0
      }
      return acc
    }, {})

    const filters = {
      ProductId: missingProductIds.map(encodeURIComponent).join(','),
      ContentLocale: loc,
      ...reviewsStatFilterFields
    }

    const filter = Object.keys(filters).reduce((acc, filter) => {
      acc.push(`${filter}:${filters[filter]}`)
      return acc
    }, [])

    try {
      const response = await callApi(context, {
        uri: '/data/statistics.json',
        qsStringifyOptions: {
          indices: false
        },
        qs: {
          filter,
          stats: 'Reviews'
        }
      })
      if (response) {
        const { Results } = response
        if (Results.length) {
          return Results.reduce((acc, result) => {
            acc[result.ProductStatistics.ProductId] = {
              count: result.ProductStatistics.ReviewStatistics.TotalReviewCount || 0,
              average: normalizeRating(result.ProductStatistics.ReviewStatistics.AverageOverallRating),
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
