class UnauthorizedError extends Error {
  constructor (message) {
    super()

    this.code = UnauthorizedError.code
    this.message = message || 'User not authorized'
  }
}

UnauthorizedError.code = 'EACCESS'

module.exports = UnauthorizedError
