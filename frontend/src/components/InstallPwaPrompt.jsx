import { useState, useEffect } from 'react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = Boolean(
      window.navigator?.standalone ||
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches)
    );

    if (iosDevice && !isStandalone) {
      setIsIos(true);
      // Don't auto show iOS banner if dismissed before
      const dismissed = localStorage.getItem('pwa_ios_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    // Listen for beforeinstallprompt event (Android / Chrome / Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice outcome:', outcome);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (isIos) {
      localStorage.setItem('pwa_ios_dismissed', 'true');
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div
        className="glass-card"
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          left: '1.25rem',
          maxWidth: '420px',
          margin: '0 auto',
          zIndex: 9999,
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(79, 70, 229, 0.4)',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          borderRadius: '1rem',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-mobile-screen-button" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
            Install Aplikasi Surat
          </h4>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-light)', lineHeight: '1.3' }}>
            Pasang di layar utama HP untuk akses cepat & tampilan layaknya aplikasi mobile.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={handleInstallClick}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            <i className="fa-solid fa-download" /> Install
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-light)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              textAlign: 'center',
            }}
          >
            Nanti saja
          </button>
        </div>
      </div>

      {/* Modal Panduan iOS */}
      {showIosGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '380px',
              width: '100%',
              padding: '1.5rem',
              background: 'var(--bg-card)',
              borderRadius: '1rem',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fa-brands fa-apple" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Cara Install di iPhone / iPad</h3>
            <ol style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-main)', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
              <li>Buka website ini menggunakan browser <strong>Safari</strong>.</li>
              <li>Tekan tombol <strong>Bagikan (Share)</strong> <i className="fa-solid fa-share-from-square" /> di bagian bawah layar.</li>
              <li>Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
              <li>Selesai! Ikon Surat App akan tampil di layar HP Anda.</li>
            </ol>
            <button onClick={() => setShowIosGuide(false)} className="btn btn-primary btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
