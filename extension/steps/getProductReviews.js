const callApi = require('../api/callApi')

/**
 * @param {Object} context
 * @param {Object} input
 * @returns {Promise<{coupons}>}
 */
module.exports = async (context, input) => {
  const { sortMap, ratingRoundingStep } = context.config

  const roundFractions = 1.0 / ratingRoundingStep
  const normalizeRating = (rating) => Math.ceil(rating * 20 * roundFractions) / roundFractions

  const {
    productId,
    baseProductId,
    offset = 0,
    limit = 10,
    sort
  } = input

  const prodId = baseProductId || productId

  const { Results = [], TotalResults = 0 } = await callApi(context, {
    uri: '/data/reviews.json',
    qs: {
      filter: `ProductId:${encodeURIComponent(prodId)}`,
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
    rate: normalizeRating(result.Rating),
    title: result.Title,
    review: result.ReviewText
  }))

  return {
    totalReviewCount: TotalResults,
    reviews
  }
}
