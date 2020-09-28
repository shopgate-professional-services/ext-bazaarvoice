class NotFoundError extends Error {
  constructor (message) {
    super()

    this.code = NotFoundError.code
    this.message = message
  }
}

NotFoundError.code = 'ENOTFOUND'

module.exports = NotFoundError
