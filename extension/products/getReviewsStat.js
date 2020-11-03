const { wrap } = require('../lib/cache')
const callApi = require('../api/callApi')
const { toEngageRating, mathRound, toApiLocale, toQsFilter } = require('../lib/helpers')

/**
 * Get reviews statistic for given product IDs
 * @param {Object} context
 * @param {String[]} productIds
 * @returns {Promise<{Object[]}>}
 */
module.exports = async (context, productIds) => {
  const ratings = await wrap(context, productIds, async (missingProductIds) => {
    const { reviewsFilterFields, languageId, ratingRoundingStep } = context.config

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
      ContentLocale: toApiLocale(languageId),
      ...reviewsFilterFields
    }

    try {
      const response = await callApi(context, {
        uri: '/data/statistics.json',
        qsStringifyOptions: {
          indices: false
        },
        qs: {
          filter: toQsFilter(filters),
          stats: 'Reviews'
        }
      })
      if (response) {
        const { Results } = response
        if (Results.length) {
          return Results.reduce((acc, result) => {
            acc[result.ProductStatistics.ProductId] = {
              count: result.ProductStatistics.ReviewStatistics.TotalReviewCount || 0,
              average: toEngageRating(mathRound(
                result.ProductStatistics.ReviewStatistics.AverageOverallRating,
                ratingRoundingStep
              )),
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
