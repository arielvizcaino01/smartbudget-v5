"use client";

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  if (!promptEvent || dismissed) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-soft sm:px-5">
      <div>
        <p className="text-sm font-semibold text-slate-900">Instala SmartBudget</p>
        <p className="text-xs text-slate-500">Ábrela desde tu pantalla de inicio y úsala con una vista más parecida a una app.</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setDismissed(true)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">
          Ahora no
        </button>
        <button
          onClick={async () => {
            await promptEvent.prompt();
            await promptEvent.userChoice;
            setPromptEvent(null);
          }}
          className="btn-primary text-sm"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
