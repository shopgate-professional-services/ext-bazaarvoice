const getReviewsStat = require('../products/getReviewsStat')

/**
 * @param {Object} context
 * @param {Object} input
 * @returns {Promise<{coupons}>}
 */
module.exports = async (context, { products }) => {
  const { ratings } = await getReviewsStat(context, products.map(p => p.id))

  products.forEach(product => {
    if (ratings[product.id]) {
      // Replace default rating
      product.rating = ratings[product.id]
    }
  })

  return {
    products
  }
}
