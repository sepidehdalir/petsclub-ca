/**
 * Decide whether a deployment should advertise crawl access.
 * Preview and development builds must remain blocked even if they inherit the
 * production canonical URL through NEXT_PUBLIC_SITE_URL.
 */
export function isPublicProductionDeployment(
  origin: string,
  domain: string,
  vercelEnvironment: string | undefined,
): boolean {
  return (
    origin === `https://${domain}` &&
    (vercelEnvironment === undefined || vercelEnvironment === "production")
  );
}
