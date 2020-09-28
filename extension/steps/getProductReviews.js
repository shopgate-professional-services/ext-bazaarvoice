const callApi = require('../api/callApi')

/**
 * @param {Object} context
 * @param {Object} input
 * @returns {Promise<{coupons}>}
 */
module.exports = async (context, input) => {
  const { sortMap } = context.config

  const {
    productId,
    baseProductId,
    offset = 0,
    limit = 10,
    sort
  } = input

  const prodId = baseProductId || productId

  const { Results, TotalResults } = await callApi(context, {
    uri: '/data/reviews.json',
    qs: {
      filter: `ProductId:${encodeURIComponent(prodId)}`,
      stats: 'Reviews',
      limit,
      offset,
      sort: sortMap[sort] || sort
    }
  })

  const reviews = Results.map(result => ({
    id: result.Id,
    author: result.UserNickname,
    date: result.LastModificationTime,
    rate: Math.round(result.Rating * 20),
    title: result.Title,
    review: result.ReviewText
  }))

  return {
    totalReviewCount: TotalResults,
    reviews
  }
}
