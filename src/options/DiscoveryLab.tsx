import { useState, useEffect } from 'preact/hooks';

interface FeedbackStats {
  hit: number;
  miss: number;
}

interface FeatureStats {
  [key: string]: number;
}

export function DiscoveryLab() {
  const [feedback, setFeedback] = useState<FeedbackStats>({ hit: 0, miss: 0 });
  const [features, setFeatures] = useState<FeatureStats>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['roast-feedback-stats', 'feature-requests-stats'], (result) => {
      if (result['roast-feedback-stats']) setFeedback(result['roast-feedback-stats']);
      if (result['feature-requests-stats']) setFeatures(result['feature-requests-stats']);
    });
  }, []);

  const totalRoasts = feedback.hit + feedback.miss;
  const hitRate = totalRoasts > 0 ? (feedback.hit / totalRoasts) * 100 : 0;
  const missRate = totalRoasts > 0 ? (feedback.miss / totalRoasts) * 100 : 0;

  const sortedFeatures = Object.entries(features).sort((a, b) => b[1] - a[1]);
  const maxFeatureCount = sortedFeatures.length > 0 ? sortedFeatures[0][1] : 1;

  async function handleSubmit() {
    setSubmitting(true);
    setSuccess(false);
    
    const payload = {
      timestamp: new Date().toISOString(),
      feedback,
      features,
      platform: navigator.platform,
      userAgent: navigator.userAgent
    };

    try {
      // TASK-23: Submit to Vercel API
      const response = await fetch('https://scrollshame.com/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('[Discovery Lab] Failed to submit:', err);
      // Fallback: Copy to clipboard if API fails
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      alert('Network error. Discovery bundle copied to clipboard instead. Please send manually! 🫡');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section class="settings-section discovery-lab">
      <h2>Discovery Lab</h2>
      <p class="hint">Help us shape the chaos. Submit your anonymous interaction signals.</p>

      <div class="discovery-stats">
        {/* Roast Sentiment */}
        <div class="stat-group">
          <h3>Roast Sentiment</h3>
          <div class="bar-container">
            <div class="bar hit" style={{ width: `${hitRate}%` }} />
            <div class="bar miss" style={{ width: `${missRate}%` }} />
          </div>
          <div class="bar-label">
            <span>Hits: {feedback.hit} ({hitRate.toFixed(0)}%)</span>
            <span>Misses: {feedback.miss} ({missRate.toFixed(0)}%)</span>
          </div>
        </div>

        {/* Feature Appetite */}
        <div class="stat-group">
          <h3>Feature Appetite</h3>
          <div class="feature-list">
            {sortedFeatures.length > 0 ? sortedFeatures.map(([name, count]) => (
              <div key={name} class="feature-row">
                <div class="feature-meta">
                  <span>{name}</span>
                  <span>{count} req.</span>
                </div>
                <div class="feature-bar-bg">
                  <div class="feature-bar-fill" style={{ width: `${(count / maxFeatureCount) * 100}%` }} />
                </div>
              </div>
            )) : <p class="hint">No feature signals recorded yet.</p>}
          </div>
        </div>
      </div>

      <button 
        class="btn-submit-lab" 
        onClick={handleSubmit}
        disabled={submitting || totalRoasts === 0}
      >
        {submitting ? 'Transmitting...' : success ? 'Signals Received 🫡' : 'Submit Signals to Dev Lab'}
      </button>
      
      <button 
        class="btn-activate" 
        style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.65rem' }}
        onClick={() => {
          const bundle = { feedback, features };
          navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
          alert('Discovery bundle copied to clipboard!');
        }}
      >
        Copy Raw Discovery Bundle
      </button>
    </section>
  );
}
