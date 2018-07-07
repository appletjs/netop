import inStandardBrowser from './inStandardBrowser';

export default function readCookie(name) {
  // Standard browser environment support document.cookie
  if (!inStandardBrowser()) return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return (match ? decodeURIComponent(match[3]) : null);
}
