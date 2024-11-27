export function getFullUrl(
  protocol: string,
  host: string,
  path: string,
): string {
  return `${protocol}://${host}${path}`;
}
