import type { AnalyticsConsentState } from '../hooks/useAnalyticsConsent';

interface AnalyticsConsentBannerProps {
  consent: AnalyticsConsentState;
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export default function AnalyticsConsentBanner({
  consent,
  isOpen,
  onAccept,
  onDecline,
  onClose,
}: AnalyticsConsentBannerProps) {
  if (!isOpen) return null;

  return (
    <aside className="consent" aria-live="polite" aria-label="Analytics consent">
      <p>
        <strong>Allow analytics?</strong>
        Magpie uses Cloudflare Web Analytics to measure visits and performance. It stays off until you opt in.
      </p>
      <div className="consent-actions">
        {consent !== 'unknown' ? (
          <button type="button" className="btn btn-sm btn-line" onClick={onClose}>
            Close
          </button>
        ) : null}
        <button type="button" className="btn btn-sm btn-line" onClick={onDecline}>
          Decline
        </button>
        <button type="button" className="btn btn-sm" onClick={onAccept}>
          Accept
        </button>
      </div>
    </aside>
  );
}
