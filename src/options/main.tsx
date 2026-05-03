import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { isPro, isProPlus, upgradeToPro, upgradeToProPlus } from '../lib/license';
import type { ExtensionSettings } from '../lib/storage';
import type { RoastVoice } from '../lib/roast-pools';
import { VOICE_LABELS, PRO_VOICES, PRO_PLUS_VOICES } from '../lib/roast-pools';

const DEFAULT_SETTINGS: ExtensionSettings = {
  notificationTime:    'monday-9am',
  trackTabCount:       true,
  trackScrollVelocity: true,
  trackLateNight:      true,
  trackTabChurn:       true,
  trackSessionLength:  true,
  roastVoice:          'therapist',
  osHarassmentEnabled: false,
  tabHijackingEnabled: false,
  touchGrassEnabled: false,
};

function Options() {
  const [settings,    setSettings   ] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [tier,        setTier       ] = useState<'free' | 'pro' | 'pro-plus'>('free');
  const [saved,       setSaved      ] = useState(false);
  const [licenseKey,  setLicenseKey ] = useState('');
  const [keyError,    setKeyError   ] = useState('');
  const [keySuccess,  setKeySuccess ] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [pro, proPlus] = await Promise.all([isPro(), isProPlus()]);
    setTier(proPlus ? 'pro-plus' : pro ? 'pro' : 'free');
    chrome.storage.local.get('settings', (result) => {
      if (result.settings) setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  }

  function handleSave() {
    chrome.storage.local.set({ settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function handleActivateLicense() {
    setKeyError('');
    setKeySuccess(false);
    const key = licenseKey.trim().toUpperCase();
    if (!key) { setKeyError('Enter your license key.'); return; }
    try {
      // Try Pro+ first, then Pro
      try { await upgradeToProPlus(key); setTier('pro-plus'); }
      catch { await upgradeToPro(key); setTier(tier === 'free' ? 'pro' : tier); }
      setKeySuccess(true);
      setLicenseKey('');
    } catch {
      setKeyError('Invalid license key. Check and try again.');
    }
  }

  function updateSetting<K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  const isPaid = tier !== 'free';
  const isPlus = tier === 'pro-plus';
  const allowedVoices: RoastVoice[] = isPlus ? PRO_PLUS_VOICES : isPaid ? PRO_VOICES : ['therapist'];

  const ALL_VOICES: { voice: RoastVoice; tier: 'free' | 'pro' | 'pro-plus' }[] = [
    { voice: 'therapist',           tier: 'free'     },
    { voice: 'drill-sergeant',      tier: 'pro'      },
    { voice: 'your-mom',            tier: 'pro'      },
    { voice: 'tech-bro',            tier: 'pro'      },
    { voice: 'accountant',          tier: 'pro'      },
    { voice: 'reddit-commenter',    tier: 'pro-plus' },
    { voice: 'conspiracy-theorist', tier: 'pro-plus' },
    { voice: 'your-ex',             tier: 'pro-plus' },
    { voice: 'gpt-4',               tier: 'pro-plus' },
  ];

  const TierBadge = () => {
    if (tier === 'pro-plus') return <span class="badge plus">Pro+</span>;
    if (tier === 'pro')      return <span class="badge pro">Pro</span>;
    return <span class="badge free">Free</span>;
  };

  return (
    <div class="options-container">
      <header class="options-header">
        <h1>ScrollShame <TierBadge /></h1>
        <p class="tagline">Your browser knows what you did.</p>
      </header>

      {/* ── Upgrade Banners ─────────────────────────────────────── */}
      {!isPaid && (
        <div class="upgrade-banner yellow">
          <div>
            <p class="upgrade-title">🔓 Upgrade to Pro Base — $15</p>
            <p class="upgrade-desc">All 5 roast voices · Unlimited history · Global rankings</p>
          </div>
          <button class="btn-upgrade" onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}>
            $15
          </button>
        </div>
      )}
      {isPaid && !isPlus && (
        <div class="upgrade-banner red">
          <div>
            <p class="upgrade-title">⚡ Upgrade to Pro+ — $4.99/mo</p>
            <p class="upgrade-desc">All 9 voices · Live interventions · Prediction engine</p>
          </div>
          <button class="btn-upgrade" onClick={() => window.open('https://polar.sh/scrollshame/plus', '_blank')}>
            $4.99/mo
          </button>
        </div>
      )}

      {/* ── License Key ─────────────────────────────────────────── */}
      <section class="settings-section">
        <h2>License</h2>
        <div class="license-row">
          <input
            class="license-input"
            type="text"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            value={licenseKey}
            onInput={(e) => setLicenseKey((e.target as HTMLInputElement).value)}
          />
          <button class="btn-activate" onClick={handleActivateLicense}>Activate</button>
        </div>
        {keyError   && <p class="hint error">{keyError}</p>}
        {keySuccess  && <p class="hint success">✓ License activated! Enjoy your chaos.</p>}
      </section>

      {/* ── Roast Voice ─────────────────────────────────────────── */}
      <section class="settings-section">
        <h2>Roast Voice</h2>
        <div class="voice-list">
          {ALL_VOICES.map(({ voice, tier: reqTier }) => {
            const locked = !allowedVoices.includes(voice);
            const active = settings.roastVoice === voice;
            return (
              <label
                key={voice}
                class={`voice-option${active ? ' active' : ''}${locked ? ' locked' : ''}`}
                onClick={() => {
                  if (locked) {
                    window.open('https://polar.sh/scrollshame', '_blank');
                  } else {
                    updateSetting('roastVoice', voice);
                  }
                }}
              >
                <span class="voice-name">{VOICE_LABELS[voice]}</span>
                {reqTier !== 'free' && (
                  <span class={`voice-tier-badge ${reqTier}`}>
                    {reqTier === 'pro-plus' ? 'Pro+' : 'Pro'}
                  </span>
                )}
                {active && <span class="voice-active-dot" />}
              </label>
            );
          })}
        </div>
      </section>

      {/* ── Tracking Toggles ────────────────────────────────────── */}
      <section class="settings-section">
        <h2>Tracking</h2>
        {([
          ['trackTabCount',       'Tab count'],
          ['trackScrollVelocity', 'Scroll velocity'],
          ['trackLateNight',      'Late-night sessions'],
          ['trackTabChurn',       'Tab churn'],
          ['trackSessionLength',  'Session length'],
        ] as const).map(([key, label]) => (
          <div key={key} class="setting-item">
            <label class="toggle-label">
              <span>{label}</span>
              <div class={`toggle${settings[key] ? ' on' : ''}`}
                onClick={() => updateSetting(key, !settings[key] as any)}
              >
                <div class="toggle-thumb" />
              </div>
            </label>
          </div>
        ))}
      </section>

      {/* ── Chaos Pass Features ─────────────────────────────────── */}
      <section class="settings-section">
        <h2>Chaos Pass Exclusive</h2>
        <div class="setting-item">
          <label class="toggle-label" style={{ opacity: isPlus ? 1 : 0.5 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>OS-Level Harassment</span>
              <span class="hint" style={{ fontSize: '11px', marginTop: '2px', color: 'var(--text-muted)' }}>
                Get aggressively roasted via system notifications when you're spiraling.
              </span>
            </div>
            <div class={`toggle${settings.osHarassmentEnabled ? ' on' : ''}${!isPlus ? ' locked' : ''}`}
              onClick={() => {
                if (isPlus) updateSetting('osHarassmentEnabled', !settings.osHarassmentEnabled);
                else window.open('https://polar.sh/scrollshame/plus', '_blank');
              }}
            >
              <div class="toggle-thumb" />
            </div>
          </label>
        </div>

        <div class="setting-item">
          <label class="toggle-label" style={{ opacity: isPlus ? 1 : 0.5 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Tab Title Hijacking</span>
              <span class="hint" style={{ fontSize: '11px', marginTop: '2px', color: 'var(--text-muted)' }}>
                Get passive-aggressive messages on tabs you ignore.
              </span>
            </div>
            <div class={`toggle${settings.tabHijackingEnabled ? ' on' : ''}${!isPlus ? ' locked' : ''}`}
              onClick={() => {
                if (isPlus) updateSetting('tabHijackingEnabled', !settings.tabHijackingEnabled);
                else window.open('https://polar.sh/scrollshame/plus', '_blank');
              }}
            >
              <div class="toggle-thumb" />
            </div>
          </label>
        </div>

        <div class="setting-item">
          <label class="toggle-label" style={{ opacity: isPlus ? 1 : 0.5 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Forced "Touch Grass" Breaks</span>
              <span class="hint" style={{ fontSize: '11px', marginTop: '2px', color: 'var(--text-muted)' }}>
                Get physically stopped from doomscrolling with unskippable breaks.
              </span>
            </div>
            <div class={`toggle${settings.touchGrassEnabled ? ' on' : ''}${!isPlus ? ' locked' : ''}`}
              onClick={() => {
                if (isPlus) updateSetting('touchGrassEnabled', !settings.touchGrassEnabled);
                else window.open('https://polar.sh/scrollshame/plus', '_blank');
              }}
            >
              <div class="toggle-thumb" />
            </div>
          </label>
        </div>
      </section>

      {/* ── Save ────────────────────────────────────────────────── */}
      <div class="actions">
        <button class="btn-primary" onClick={handleSave}>Save Settings</button>
        {saved && <span class="saved-msg">✓ Saved</span>}
      </div>

      <footer class="options-footer">
        <p>All data is stored locally in your browser. Nothing is ever transmitted.</p>
      </footer>
    </div>
  );
}

const root = document.getElementById('app');
if (root) render(<Options />, root);