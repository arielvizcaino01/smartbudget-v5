"use client";

import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isIosSafari() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const notCriOS = !/CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && notCriOS;
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [canShowIosHelp, setCanShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    setCanShowIosHelp(isIosSafari());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const mode = useMemo(() => {
    if (isStandalone()) return 'hidden';
    if (promptEvent) return 'android';
    if (canShowIosHelp) return 'ios';
    return 'hidden';
  }, [promptEvent, canShowIosHelp]);

  if (dismissed || mode === 'hidden') return null;

  return (
    <div className="mb-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-soft sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Instala SmartBudget</p>
          {mode === 'android' ? (
            <p className="text-xs text-slate-500">Instálala para abrirla como app, con icono propio, carga rápida y experiencia de pantalla completa.</p>
          ) : (
            <p className="text-xs text-slate-500">En iPhone, toca Compartir y luego Añadir a pantalla de inicio para instalarla sin App Store.</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
          >
            Ahora no
          </button>

          {mode === 'android' ? (
            <button
              onClick={async () => {
                if (!promptEvent) return;
                await promptEvent.prompt();
                await promptEvent.userChoice;
                setPromptEvent(null);
              }}
              className="btn-primary text-sm"
            >
              Instalar
            </button>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Compartir → Añadir a inicio
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
