import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

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

  const [licenseKey, setLicenseKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  function loadSettings() {
    chrome.storage.local.get('settings', (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });

    chrome.storage.sync.get('license-key', (result) => {
      if (result['license-key']) {
        setLicenseKey(result['license-key']);
      }
    });
  }

  function handleSave() {
    chrome.storage.local.set({ settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function handleLicenseSave() {
    chrome.storage.sync.set({ 'license-key': licenseKey }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div class="options-container">
      <header class="options-header">
        <h1>ScrollShame Settings</h1>
      </header>

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
        >
          <option value="therapist">The Therapist (Free)</option>
          <option value="drill-sergeant">The Drill Sergeant ($1.99)</option>
          <option value="your-mom">Your Mom ($1.99)</option>
          <option value="tech-bro">Tech Bro ($1.99)</option>
          <option value="accountant">The Accountant ($1.99)</option>
        </select>
        <p class="hint">Upgrade to Shame Bundle ($3.99) to unlock all voices!</p>
      </section>

      <section class="settings-section">
        <h2>License Key</h2>
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Enter your license key"
          class="text-input"
        />
        <button class="btn-secondary" onClick={handleLicenseSave}>
          Apply Key
        </button>
      </section>

      <div class="actions">
        <button class="btn-primary" onClick={handleSave}>
          Save Settings
        </button>
        {saved && <span class="saved-msg">Saved!</span>}
      </div>

      <footer class="options-footer">
        <p>Data is stored locally. Nothing leaves your browser.</p>
        <p class="privacy-link">See our privacy policy</p>
      </footer>
    </div>
  );
}

const root = document.getElementById('app');
if (root) {
  render(<Options />, root);
}