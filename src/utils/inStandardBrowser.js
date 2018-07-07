/**
 * Determine if we're running in a standard browser environment
 *
 * This allows netop to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
export default function inStandardBrowser() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }

  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}
