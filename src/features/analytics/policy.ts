export function validMeasurementId(value: string | undefined): value is string {
  return typeof value === "string" && /^G-[A-Z0-9]{6,20}$/.test(value);
}
export function publicPageLocation(path: string, allowedPaths: readonly string[]): string | null {
  // Exact public-route allowlist excludes query strings, account pages and user-generated URLs.
  return allowedPaths.includes(path) && /^\/[a-z0-9/-]*$/.test(path)
    ? `https://thepetclub.ca${path}` : null;
}
export function analyticsHostAllowed(host: string) {
  return host === "thepetclub.ca";
}
