const callApi = require('../api/callApi')
const { toEngageRating, ceilRound, toApiLocale, toQsFilter } = require('../lib/helpers')

/**
 * @param {Object} context
 * @param {Object} input
 * @returns {Promise<{coupons}>}
 */
module.exports = async (context, input) => {
  const { sortMap, ratingRoundingStep, languageId, reviewsFilterFields } = context.config

  const {
    productId,
    baseProductId,
    offset = 0,
    limit = 10,
    sort
  } = input

  const filters = {
    ProductId: encodeURIComponent(baseProductId || productId),
    ContentLocale: toApiLocale(languageId),
    ...reviewsFilterFields
  }

  const { Results = [], TotalResults = 0 } = await callApi(context, {
    uri: '/data/reviews.json',
    qsStringifyOptions: {
      indices: false
    },
    qs: {
      filter: toQsFilter(filters),
      stats: 'Reviews',
      limit,
      offset,
      sort: sortMap[sort] || sort
    }
  }) || {}

  const reviews = Results.map(result => ({
    id: result.Id,
    author: result.UserNickname,
    date: result.LastModificationTime,
    rate: toEngageRating(ceilRound(result.Rating, ratingRoundingStep)),
    title: result.Title,
    review: result.ReviewText
  }))

  return {
    totalReviewCount: TotalResults,
    reviews
  }
}
