/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
export default function enhanceError(error, config, request, response) {
  error.config = config;
  error.request = request;
  error.response = response;
  return error;
};
