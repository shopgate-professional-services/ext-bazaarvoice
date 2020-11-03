const NotFoundError = require('../errors/NotFoundError')

/**
 * @returns {Promise<{}>}
 */
module.exports = async () => {
  throw new NotFoundError('Review not found')
}
