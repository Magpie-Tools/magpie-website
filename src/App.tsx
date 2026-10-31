import { useState } from 'react';
import AnalyticsConsentBanner from './components/AnalyticsConsentBanner';
import CloudflareAnalytics from './components/CloudflareAnalytics';
import { useAnalyticsConsent } from './hooks/useAnalyticsConsent';
import Capabilities from './sections/Capabilities';
import CTA from './sections/CTA';
import FAQ from './sections/FAQ';
import Features from './sections/Features';
import Footer from './sections/Footer';
import Hero from './sections/Hero';
import OpenSource from './sections/OpenSource';
import Screens from './sections/Screens';
import Walkthrough from './sections/Walkthrough';

export default function App() {
  const beaconToken = import.meta.env.VITE_CLOUDFLARE_BEACON_TOKEN?.trim();
  const analyticsConfigured = Boolean(beaconToken);
  const { consent, setConsent, hasStoredPreference } = useAnalyticsConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const choose = (value: 'granted' | 'denied') => {
    setConsent(value);
    setPreferencesOpen(false);
  };

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <CloudflareAnalytics consent={consent} token={beaconToken} />
      <div id="top">
        <Hero />
      </div>
      <main id="main">
        <Features />
        <Walkthrough />
        <Capabilities />
        <Screens />
        <OpenSource />
        <FAQ />
        <CTA />
      </main>
      <Footer onManageAnalytics={analyticsConfigured ? () => setPreferencesOpen(true) : undefined} />
      <AnalyticsConsentBanner
        consent={consent}
        isOpen={analyticsConfigured && (!hasStoredPreference || preferencesOpen)}
        onAccept={() => choose('granted')}
        onDecline={() => choose('denied')}
        onClose={() => setPreferencesOpen(false)}
      />
    </>
  );
}
