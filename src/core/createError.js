import enhanceError from './enhanceError';

/**
 * Create an Error with the specified message, config, error, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
export default function createError(message, config, request, response) {
  const error = new Error(message);
  return enhanceError(error, config, request, response);
}
