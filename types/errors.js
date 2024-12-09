// Define standard error types and their client-friendly aliases
const ErrorTypes = {
  VALIDATION_ERROR: {
    alias: "Bad Request",
    code: 400,
    errorCode: "ERR_VALIDATION",
  },
  AUTHENTICATION_ERROR: {
    alias: "Unauthorized",
    code: 401,
    errorCode: "ERR_AUTHENTICATION",
  },
  AUTHORIZATION_ERROR: {
    alias: "Forbidden",
    code: 403,
    errorCode: "ERR_AUTHORIZATION",
  },
  RESOURCE_NOT_FOUND: {
    alias: "Not Found",
    code: 404,
    errorCode: "ERR_NOT_FOUND",
  },
  SERVER_ERROR: {
    alias: "Internal Server Error",
    code: 500,
    errorCode: "ERR_SERVER",
  },
  DATABASE_ERROR: {
    alias: "Internal Server Error",
    code: 500,
    errorCode: "ERR_DATABASE",
  },
  SERVICE_UNAVAILABLE: {
    alias: "Service Unavailable",
    code: 503,
    errorCode: "ERR_SERVICE_UNAVAILABLE",
  },
  TIMEOUT_ERROR: {
    alias: "Request Timeout",
    code: 408,
    errorCode: "ERR_TIMEOUT",
  },
  INVALID_INPUT_ERROR: {
    alias: "Bad Request",
    code: 400,
    errorCode: "ERR_INVALID_INPUT",
  },
  EXTERNAL_SERVICE_ERROR: {
    alias: "Bad Gateway",
    code: 502,
    errorCode: "ERR_EXTERNAL_SERVICE",
  },
  UNKNOWN_ERROR: {
    alias: "Internal Server Error",
    code: 500,
    errorCode: "ERR_UNKNOWN",
  },
};

// Custom AppError class with static properties for error types
class AppError extends Error {
  constructor(err, message, details = null) {
    super(message);
    const errorInfo = err;
    this.statusCode = errorInfo.code;
    this.errorCode = errorInfo.errorCode;
    this.clientMessage = errorInfo.alias;
    this.details = details; // Optional: internal debugging details

    // Log the error automatically
    AppError.logError(this);
  }

  // Log error details to the console or an external system
  static logError(error) {
    console.error(
      `[${new Date().toISOString()}] Error: ${error.message}`,
      error.details || ""
    );
  }

  // Automatically send a client-friendly response
  sendResponse(res) {
    res.status(this.statusCode).json({
      status: this.statusCode,
      errorCode: this.errorCode,
      message: this.clientMessage,
    });
  }
}

module.exports = { ErrorTypes, AppError };
