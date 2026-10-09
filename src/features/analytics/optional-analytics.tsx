"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { findAffiliateOffer } from "@/features/commerce/offers";
import { findProduct } from "@/features/commerce/products";
import { analyticsHostAllowed, publicPageLocation, validMeasurementId } from "./policy";

type Command = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Command; [key: `ga-disable-${string}`]: boolean | undefined; }
}

/** No Google request or cookie before explicit consent. Consent lasts this document only. */
export function OptionalAnalytics({ measurementId, allowedPaths }: { measurementId?: string; allowedPaths: readonly string[] }) {
  const path = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lastPage = useRef<string | null>(null);
  const initialized = useRef(false);
  const location = publicPageLocation(path, allowedPaths);

  useEffect(() => {
    if (!ready || !allowed || !location || !analyticsHostAllowed(window.location.hostname)) return;
    if (lastPage.current === location) return;
    lastPage.current = location;
    window.gtag?.("event", "page_view", { page_location: location, page_referrer: "", send_to: measurementId });
  }, [ready, allowed, location, measurementId]);

  useEffect(() => {
    if (!ready || !allowed || !location || !analyticsHostAllowed(window.location.hostname)) return;
    function affiliate(event: Event) {
      const id = (event as CustomEvent<{ offer_id?: string }>).detail?.offer_id;
      const offer = typeof id === "string" ? findAffiliateOffer(id) : undefined;
      if (offer) window.gtag?.("event", "affiliate_click", { offer_id: offer.id, partner: offer.partner, page_location: location, send_to: measurementId });
    }
    function product(event: Event) {
      const id = (event as CustomEvent<{ product_id?: string }>).detail?.product_id;
      const item = typeof id === "string" ? findProduct(id) : undefined;
      if (item) window.gtag?.("event", "product_click", { product_id: item.id, page_location: location, send_to: measurementId });
    }
    function cta(event: Event) {
      const id = (event as CustomEvent<{ cta_id?: string }>).detail?.cta_id;
      if (id === "partnership_email_draft") window.gtag?.("event", "cta_click", { cta_id: id, page_location: location, send_to: measurementId });
    }
    window.addEventListener("thepetclub:affiliate-click", affiliate);
    window.addEventListener("thepetclub:product-click", product);
    window.addEventListener("thepetclub:cta-click", cta);
    return () => {
      window.removeEventListener("thepetclub:affiliate-click", affiliate);
      window.removeEventListener("thepetclub:product-click", product);
      window.removeEventListener("thepetclub:cta-click", cta);
    };
  }, [ready, allowed, location, measurementId]);

  if (!validMeasurementId(measurementId)) return null;
  const configuredId = measurementId;
  function enable() {
    if (!analyticsHostAllowed(window.location.hostname)) return;
    window[`ga-disable-${configuredId}`] = false;
    window.gtag?.("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    setAllowed(true);
  }
  function disable() {
    window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    window[`ga-disable-${configuredId}`] = true;
    setAllowed(false);
    setReady(false);
    lastPage.current = null;
    // Remove accessible first-party GA cookies after withdrawal. A reload discards the loaded tag.
    for (const name of document.cookie.split(";").map((cookie) => cookie.trim().split("=")[0])) {
      if (name && /^_ga(?:_|$)/.test(name)) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.thepetclub.ca; SameSite=Lax`;
      }
    }
  }
  return <div className="mt-6 text-body-sm text-foreground-muted">
    <button type="button" className="min-h-11 underline" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(!settingsOpen)}>Analytics preferences</button>
    {settingsOpen ? <div className="max-w-xl rounded-md border border-border p-4">
      <p>Optional Google Analytics measures public page views and product or partnership clicks. Google receives technical browser information and may use cookies. We send no email addresses or message text. Off by default; your choice lasts until you reload or close this page. <a className="underline" href="/privacy-policy">Privacy details</a>.</p>
      <p aria-live="polite">Analytics is {allowed ? "on" : "off"}.</p>
      <div className="flex flex-wrap gap-4"><button type="button" onClick={enable} className="min-h-11 underline">Allow analytics</button><button type="button" onClick={disable} className="min-h-11 underline">Turn off analytics</button></div>
    </div> : null}
    {allowed && location ? <Script id="petclub-ga4" src={`https://www.googletagmanager.com/gtag/js?id=${configuredId}`} strategy="afterInteractive" onReady={() => {
      if (!analyticsHostAllowed(window.location.hostname)) return;
      window.dataLayer ??= [];
      window.gtag ??= (...args: unknown[]) => { window.dataLayer?.push(args); };
      if (!initialized.current) {
        initialized.current = true;
        window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        window.gtag("js", new Date());
        window.gtag("config", configuredId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location, page_referrer: "" });
      }
      setReady(true);
    }} /> : null}
  </div>;
}
