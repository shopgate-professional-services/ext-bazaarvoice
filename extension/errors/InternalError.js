class InternalError extends Error {
  constructor (message) {
    super()

    this.code = 'EINTERNAL'
    this.message = message || 'An internal error occurred.'
  }
}

module.exports = InternalError
