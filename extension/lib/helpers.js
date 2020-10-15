/**
 * Convert to 100 rate matrix
 * @param {number} rating
 * @returns {number}
 */
module.exports.toEngageRating = rating => rating * 20

/**
 * Ceil to closest rounding step
 * @param {number} rating
 * @param {number} roundingStep
 * @returns {number}
 */
module.exports.ceilRound = (rating, roundingStep = 0.5) => {
  const roundFractions = 1.0 / roundingStep
  return Math.ceil(rating * roundFractions) / roundFractions
}

/**
 * Convert App lang to API locale
 * @param {string} languageId
 * @returns {string}
 */
module.exports.toApiLocale = languageId => (
  `${languageId.substring(0, 2)}_${languageId.substring(3, 5).toUpperCase()}`
)

/**
 * Convert POJO filters to array of qs strings
 * @param {Object} filters
 * @returns {string[]}
 */
module.exports.toQsFilter = filters => (
  Object.keys(filters).reduce((acc, filter) => {
    acc.push(`${filter}:${filters[filter]}`)
    return acc
  }, [])
)
