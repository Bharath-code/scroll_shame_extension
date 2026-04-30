import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { isPro, upgradeToPro } from '../lib/license';

const PRO_VOICES = ['therapist', 'drill-sergeant', 'your-mom', 'tech-bro', 'accountant'];
const FREE_VOICES = ['therapist'];

function Options() {
  const [settings, setSettings] = useState({
    notificationTime: 'monday-9am',
    trackTabCount: true,
    trackScrollVelocity: true,
    trackLateNight: true,
    trackTabChurn: true,
    trackSessionLength: true,
    roastVoice: 'therapist'
  });

  const [isProUser, setIsProUser] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const pro = await isPro();
    setIsProUser(pro);

    chrome.storage.local.get('settings', (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }

  function handleSave() {
    chrome.storage.local.set({ settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div class="options-container">
      <header class="options-header">
        <h1>ScrollShame Settings {!isProUser && <span class="free-badge">Free</span>}{isProUser && <span class="pro-badge">Pro</span>}</h1>
      </header>

      {!isProUser && (
        <div class="upgrade-banner">
          <p>🔓 Unlock all 5 roast voices + watermark-free exports</p>
          <button class="btn-upgrade" onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}>
            Upgrade to Pro - $1.99
          </button>
        </div>
      )}

      <section class="settings-section">
        <h2>Tracking</h2>
        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.trackTabCount}
              onChange={(e) => setSettings({...settings, trackTabCount: e.target.checked})}
            />
            Track tab count
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.trackScrollVelocity}
              onChange={(e) => setSettings({...settings, trackScrollVelocity: e.target.checked})}
            />
            Track scroll velocity
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.trackLateNight}
              onChange={(e) => setSettings({...settings, trackLateNight: e.target.checked})}
            />
            Track late-night sessions
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.trackTabChurn}
              onChange={(e) => setSettings({...settings, trackTabChurn: e.target.checked})}
            />
            Track tab churn
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.trackSessionLength}
              onChange={(e) => setSettings({...settings, trackSessionLength: e.target.checked})}
            />
            Track session length
          </label>
        </div>
      </section>

      <section class="settings-section">
        <h2>Roast Voice</h2>
        <select
          value={settings.roastVoice}
          onChange={(e) => setSettings({...settings, roastVoice: e.target.value})}
          class="select-input"
          disabled={!isProUser && settings.roastVoice !== 'therapist'}
        >
          <option value="therapist">The Therapist (Free)</option>
          {isProUser ? (
            <>
              <option value="drill-sergeant">The Drill Sergeant</option>
              <option value="your-mom">Your Mom</option>
              <option value="tech-bro">Tech Bro</option>
              <option value="accountant">The Accountant</option>
            </>
          ) : (
            <>
              <option value="drill-sergeant" disabled>The Drill Sergeant 🔒 (Pro)</option>
              <option value="your-mom" disabled>Your Mom 🔒 (Pro)</option>
              <option value="tech-bro" disabled>Tech Bro 🔒 (Pro)</option>
              <option value="accountant" disabled>The Accountant 🔒 (Pro)</option>
            </>
          )}
        </select>
        {!isProUser && <p class="hint">Upgrade to unlock all voices!</p>}
      </section>

      <div class="actions">
        <button class="btn-primary" onClick={handleSave}>
          Save Settings
        </button>
        {saved && <span class="saved-msg">Saved!</span>}
      </div>

      <footer class="options-footer">
        <p>Data is stored locally. Nothing leaves your browser.</p>
      </footer>
    </div>
  );
}

const root = document.getElementById('app');
if (root) {
  render(<Options />, root);
}