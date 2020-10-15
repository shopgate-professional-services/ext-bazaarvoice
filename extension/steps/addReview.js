const callApi = require('../api/callApi')
const InternalError = require('../errors/InternalError')

/**
 * @param {Object} context
 * @param {Object} input
 * @returns {Promise<{coupons}>}
 */
module.exports = async (context, input) => {
  const { reviewSubmissionFields, languageId } = context.config
  const {
    productId,
    rate,
    author,
    title,
    review
  } = input

  // Convert de-de into de_DE
  const loc = `${languageId.substring(0, 2)}_${languageId.substring(3, 5).toUpperCase()}`

  let response = await callApi(context, {
    uri: '/data/submitreview.json',
    json: false,
    method: 'POST',
    form: {
      ProductId: productId,
      Action: 'Submit',
      Rating: rate / 20,
      UserNickname: author,
      Title: title,
      ReviewText: review,
      Locale: loc,
      ...reviewSubmissionFields
    }
  })

  if (typeof response === 'string') {
    response = JSON.parse(response)
  }

  const { HasErrors, FormErrors } = response
  if (HasErrors) {
    const [{ Message }] = Object.values(FormErrors.FieldErrors)
    throw new InternalError(Message)
  }

  return {}
}
