import { Button } from '@/components/ui/button';
import { getConsentStatus, sendEvent, setConsent } from '../lib/tracking';
import { useEffect, useState } from 'react';

interface CookieBannerProps {
  className?: string;
}

export function CookieBanner({ className }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = getConsentStatus();
    if (consent === null) {
      setIsVisible(true);
    }
  }, []);

  const handleChoice = (accepted: boolean) => {
    const visitorId = setConsent(accepted);
    setIsVisible(false);
    sendEvent({ eventType: accepted ? 'cookie_accept' : 'cookie_reject', visitorId });
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg p-4 md:p-6 ${className ?? ''}`}
      role="dialog"
      aria-label="Consentement aux cookies"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-semibold mb-1">Nous utilisons des cookies</h2>
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies pour analyser le trafic et améliorer votre expérience. En
              acceptant, vous nous aidez à comprendre comment vous utilisez notre site. Vous pouvez
              refuser sans impact sur la navigation.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => handleChoice(false)}>
              Refuser
            </Button>
            <Button size="sm" onClick={() => handleChoice(true)}>
              Accepter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
