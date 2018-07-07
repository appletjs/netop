import enhanceError from './enhanceError';

export default function createThrowable(netop) {
  return function (err) {
    if (!err || typeof err === 'string') {
      err = new Error(error || 'Unknown Error');
    } else if (!(err instanceof Error)) {
      err = new Error(String(err.message || err));
    }

    const rt = netop.runtime;
    if (err.config || !rt || !rt.config) {
      throw err;
    }

    throw enhanceError(err, rt.config, rt.request, rt.response);
  };
}
