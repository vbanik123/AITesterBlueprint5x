// App.js - React Frontend Application for AI Test Planning Agent

const { useState, useEffect } = React;

function App() {
  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'settings'
  const [jiraKeyInput, setJiraKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [jiraIssue, setJiraIssue] = useState(null);
  const [generationMeta, setGenerationMeta] = useState(null);
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ai_agent_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      jiraUrl: 'https://vijaykbanik.atlassian.net',
      jiraEmail: 'vijay.k.banik@gmail.com',
      jiraApiToken: '',
      jiraApiTokenMasked: '',
      groqApiKey: '',
      groqApiKeyMasked: '',
      groqModel: 'qwen/qwen3.8-27b',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3',
      preferredProvider: 'groq'
    };
  });

  const [envPasteText, setEnvPasteText] = useState('');
  const [envParseNotice, setEnvParseNotice] = useState(null);
  const [jiraTestStatus, setJiraTestStatus] = useState(null);
  const [llmTestStatus, setLlmTestStatus] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch initial config from server on load
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setSettings(prev => {
            const updated = {
              ...prev,
              jiraUrl: prev.jiraUrl || data.config.jiraUrl,
              jiraEmail: prev.jiraEmail || data.config.jiraEmail,
              jiraApiTokenMasked: data.config.jiraApiTokenMasked || prev.jiraApiTokenMasked,
              groqApiKeyMasked: data.config.groqApiKeyMasked || prev.groqApiKeyMasked,
              groqModel: prev.groqModel || data.config.groqModel
            };
            return updated;
          });
        }
      })
      .catch(err => console.warn('Could not load config:', err.message));
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ai_agent_settings', JSON.stringify(settings));
  }, [settings]);

  // Parse and Apply pasted .env content
  const handleApplyEnvPaste = () => {
    if (!envPasteText.trim()) {
      setEnvParseNotice({ success: false, message: 'Please paste .env text into the box.' });
      return;
    }

    const lines = envPasteText.split('\n');
    const newSettings = { ...settings };
    let parsedCount = 0;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const k = trimmed.slice(0, idx).trim().toUpperCase();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');

        if (k === 'JIRA_URL') { newSettings.jiraUrl = v; parsedCount++; }
        if (k === 'JIRA_EMAIL') { newSettings.jiraEmail = v; parsedCount++; }
        if (k === 'JIRA_API_TOKEN') { newSettings.jiraApiToken = v; parsedCount++; }
        if (k === 'GROQ_API_KEY') { newSettings.groqApiKey = v; parsedCount++; }
        if (k === 'GROQ_MODEL') { newSettings.groqModel = v; parsedCount++; }
        if (k === 'OLLAMA_URL') { newSettings.ollamaUrl = v; parsedCount++; }
        if (k === 'OLLAMA_MODEL') { newSettings.ollamaModel = v; parsedCount++; }
      }
    });

    if (parsedCount > 0) {
      setSettings(newSettings);
      setEnvParseNotice({
        success: true,
        message: `Successfully parsed and applied ${parsedCount} environment variables!`
      });
      setTimeout(() => setEnvParseNotice(null), 4000);
    } else {
      setEnvParseNotice({
        success: false,
        message: 'No valid KEY=VALUE lines found. Example: JIRA_URL=https://myjira.atlassian.net'
      });
    }
  };

  // Generate Test Plan Handler
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    const key = jiraKeyInput.trim();
    if (!key) {
      setError('Please enter a Jira issue key (e.g. QA-123 or DEMO-101).');
      return;
    }

    setLoading(true);
    setError(null);
    setCopySuccess(false);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueKey: key,
          provider: settings.preferredProvider,
          customConfig: {
            jiraUrl: settings.jiraUrl,
            jiraEmail: settings.jiraEmail,
            jiraApiToken: settings.jiraApiToken,
            groqApiKey: settings.groqApiKey,
            groqModel: settings.groqModel
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate test plan.');
      }

      setGeneratedPlan(data.testPlan);
      setJiraIssue(data.jiraIssue);
      setGenerationMeta({
        provider: data.provider,
        usedFallback: data.usedFallback
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test Jira Connection
  const handleTestJira = async () => {
    setJiraTestStatus({ loading: true });
    try {
      const res = await fetch('/api/jira/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jiraUrl: settings.jiraUrl,
          jiraEmail: settings.jiraEmail,
          jiraApiToken: settings.jiraApiToken
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setJiraTestStatus({
          success: true,
          message: `Connected! Verified user: ${data.displayName || data.email}`
        });
      } else {
        setJiraTestStatus({
          success: false,
          message: data.error || 'Connection failed'
        });
      }
    } catch (err) {
      setJiraTestStatus({ success: false, message: err.message });
    }
  };

  // Test LLM Connection (Groq or Ollama)
  const handleTestLlm = async (providerType) => {
    setLlmTestStatus({ loading: true, provider: providerType });
    try {
      const res = await fetch('/api/llm/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerType,
          groqApiKey: settings.groqApiKey,
          groqModel: settings.groqModel,
          ollamaUrl: settings.ollamaUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLlmTestStatus({
          success: true,
          message: data.message || 'LLM connection verified!'
        });
      } else {
        setLlmTestStatus({
          success: false,
          message: data.error || 'LLM connection failed.'
        });
      }
    } catch (err) {
      setLlmTestStatus({ success: false, message: err.message });
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSaveStatus({ loading: true });
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ success: true, message: 'Settings saved successfully.' });
      } else {
        setSaveStatus({ success: false, message: data.error || 'Failed saving settings.' });
      }
    } catch (err) {
      setSaveStatus({ success: false, message: err.message });
    }
  };

  const handleCopyMarkdown = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(generatedPlan).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const handleDownload = () => {
    if (!generatedPlan) return;
    const blob = new Blob([generatedPlan], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Test_Plan_${jiraIssue?.key || 'Plan'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header">
        <div className="header-brand">
          <div className="brand-icon">⚡</div>
          <div>
            <div className="brand-title">AI Test Planning Agent</div>
            <div className="brand-subtitle">Automated Jira-to-Test-Plan Generator (RICE-POT Template)</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'main' ? 'active' : ''}`}
            onClick={() => setActiveTab('main')}
          >
            <span>📄</span> Main page
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span>⚙️</span> Settings
          </button>
        </nav>
      </header>

      {/* Main Page View */}
      {activeTab === 'main' && (
        <div className="main-page-grid">
          {/* Reply with Test Plan */}
          <div className="reply-box">
            <div className="reply-header">
              <div className="reply-header-title">
                <span>📋</span> Reply with Test Plan
                {generationMeta && (
                  <span className={`badge ${generationMeta.usedFallback ? 'badge-warning' : 'badge-success'}`}>
                    Engine: ${generationMeta.provider}
                  </span>
                )}
              </div>

              {generatedPlan && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
                  >
                    {viewMode === 'formatted' ? '📝 Raw Markdown' : '👁️ Formatted View'}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={handleCopyMarkdown}
                  >
                    {copySuccess ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={handleDownload}
                  >
                    💾 Download .md
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <h3>Generating Test Plan...</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Retrieving Jira issue <strong>{jiraKeyInput.toUpperCase()}</strong> and synthesizing requirements according to RICE-POT template.
                </p>
              </div>
            ) : error ? (
              <div className="status-box status-error" style={{ margin: 'auto', maxWidth: '600px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <strong>Error:</strong> {error}
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.85 }}>
                    Tip: Try clicking <strong>DEMO-101</strong> for an instant demonstration.
                  </div>
                </div>
              </div>
            ) : generatedPlan ? (
              <div>
                {jiraIssue && (
                  <div className="meta-bar">
                    <div><strong>Key:</strong> {jiraIssue.key}</div>
                    <div><strong>Type:</strong> {jiraIssue.issueType}</div>
                    <div><strong>Priority:</strong> {jiraIssue.priority}</div>
                    <div><strong>Status:</strong> {jiraIssue.status}</div>
                    <div style={{ flex: 1 }}><strong>Summary:</strong> {jiraIssue.summary}</div>
                    {jiraIssue.rawUrl && !jiraIssue.isMock && (
                      <a href={jiraIssue.rawUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                        Open in Jira ↗
                      </a>
                    )}
                  </div>
                )}

                {viewMode === 'formatted' ? (
                  <div
                    className="markdown-body"
                    dangerouslySetInnerHTML={{
                      __html: (window.marked ? window.marked.parse(generatedPlan) : generatedPlan.replace(/\n/g, '<br/>'))
                    }}
                  />
                ) : (
                  <pre style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', lineHeight: '1.5' }}>
                    {generatedPlan}
                  </pre>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3>No Test Plan Generated Yet</h3>
                <p>
                  Enter a Jira Issue Key below (for example <code>DEMO-101</code> or your project ticket) to retrieve requirements and generate a structured QA Test Plan.
                </p>
              </div>
            )}
          </div>

          {/* Prompt (JIRA Ticket) */}
          <div className="prompt-box">
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>
              Prompt (JIRA Ticket)
            </div>

            <form className="prompt-form" onSubmit={handleGenerate}>
              <input
                type="text"
                className="input-jira"
                placeholder="Enter JIRA Ticket ID (e.g. QA-123, PROJ-1, or DEMO-101)..."
                value={jiraKeyInput}
                onChange={(e) => setJiraKeyInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Generating...' : '⚡ Generate Test Plan'}
              </button>
            </form>

            <div className="quick-chips">
              <span>Quick Samples:</span>
              <button type="button" className="chip-btn" onClick={() => setJiraKeyInput('DEMO-101')}>
                DEMO-101 (Offline Mock)
              </button>
              <button type="button" className="chip-btn" onClick={() => setJiraKeyInput('QA-123')}>
                QA-123
              </button>
              <button type="button" className="chip-btn" onClick={() => setJiraKeyInput('PROJ-1')}>
                PROJ-1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings View */}
      {activeTab === 'settings' && (
        <div className="settings-grid">
          {/* Card 0: Enter / Paste .env file */}
          <div className="wireframe-card" style={{ borderColor: '#2563eb' }}>
            <div className="card-title">
              <span>📝 Paste .env File Configuration</span>
              <span className="badge badge-info">Direct .env Import</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              Paste your raw <code>.env</code> file contents below to instantly load your Jira and Groq credentials:
            </p>
            <textarea
              className="form-control"
              style={{ minHeight: '90px', fontFamily: 'monospace', fontSize: '12px' }}
              placeholder={`JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_token
GROQ_API_KEY=gsk_...`}
              value={envPasteText}
              onChange={(e) => setEnvPasteText(e.target.value)}
            />
            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={handleApplyEnvPaste}
              >
                ⚡ Apply .env Content
              </button>
            </div>
            {envParseNotice && (
              <div className={`status-box ${envParseNotice.success ? 'status-success' : 'status-error'}`}>
                <span>{envParseNotice.success ? '✓' : '⚠️'}</span>
                <span>{envParseNotice.message}</span>
              </div>
            )}
          </div>

          {/* Card 1: JIRA Connection */}
          <div className="wireframe-card">
            <div className="card-title">
              <span>🔗 JIRA Connection</span>
              <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>Token, Email, URL</span>
            </div>

            <div className="form-group">
              <label>Jira Base URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://your-domain.atlassian.net"
                value={settings.jiraUrl}
                onChange={e => setSettings({ ...settings, jiraUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Jira Account Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="developer@example.com"
                value={settings.jiraEmail}
                onChange={e => setSettings({ ...settings, jiraEmail: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Jira API Token</label>
              <input
                type="password"
                className="form-control"
                placeholder={settings.jiraApiTokenMasked ? `Saved (${settings.jiraApiTokenMasked}) — enter new to change` : 'Enter Jira API token'}
                value={settings.jiraApiToken}
                onChange={e => setSettings({ ...settings, jiraApiToken: e.target.value })}
              />
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleTestJira}
              disabled={jiraTestStatus?.loading}
            >
              {jiraTestStatus?.loading ? 'Testing...' : 'Test Connection (button)'}
            </button>

            {jiraTestStatus && (
              <div className={`status-box ${jiraTestStatus.success ? 'status-success' : 'status-error'}`}>
                <span>{jiraTestStatus.success ? '✓' : '⚠️'}</span>
                <span>{jiraTestStatus.message}</span>
              </div>
            )}
          </div>

          {/* Card 2: LLM Configuration */}
          <div className="wireframe-card">
            <div className="card-title">
              <span>🧠 LLM Configuration</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="radio"
                    name="provider"
                    value="groq"
                    checked={settings.preferredProvider === 'groq'}
                    onChange={() => setSettings({ ...settings, preferredProvider: 'groq' })}
                  />
                  Groq.com (Cloud)
                </label>
                <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="radio"
                    name="provider"
                    value="ollama"
                    checked={settings.preferredProvider === 'ollama'}
                    onChange={() => setSettings({ ...settings, preferredProvider: 'ollama' })}
                  />
                  Ollama (Local)
                </label>
              </div>
            </div>

            {/* 1. Ollama Connection */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: '#1e293b' }}>
                1. Ollama Connection
              </div>
              <div className="form-group">
                <label>Ollama Server Endpoint</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="http://localhost:11434"
                  value={settings.ollamaUrl}
                  onChange={e => setSettings({ ...settings, ollamaUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Model Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="llama3, mistral"
                  value={settings.ollamaModel}
                  onChange={e => setSettings({ ...settings, ollamaModel: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleTestLlm('ollama')}
                disabled={llmTestStatus?.loading}
              >
                Test Local LLM
              </button>
            </div>

            {/* 2. Groq.com (API Key) */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: '#1e293b' }}>
                2. ↗ Groq.com (api Key)
              </div>
              <div className="form-group">
                <label>Groq API Key</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder={settings.groqApiKeyMasked ? `Saved (${settings.groqApiKeyMasked}) — enter new to change` : 'gsk_...'}
                  value={settings.groqApiKey}
                  onChange={e => setSettings({ ...settings, groqApiKey: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="qwen/qwen3.8-27b"
                  value={settings.groqModel}
                  onChange={e => setSettings({ ...settings, groqModel: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleTestLlm('groq')}
                disabled={llmTestStatus?.loading}
              >
                Test Groq.com
              </button>
            </div>

            {llmTestStatus && (
              <div className={`status-box ${llmTestStatus.success ? 'status-success' : 'status-error'}`}>
                <span>{llmTestStatus.success ? '✓' : '⚠️'}</span>
                <span>{llmTestStatus.message}</span>
              </div>
            )}

            <div className="button-row">
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveSettings}
                disabled={saveStatus?.loading}
              >
                {saveStatus?.loading ? 'Saving...' : '💾 Save Settings'}
              </button>
            </div>

            {saveStatus && (
              <div className={`status-box ${saveStatus.success ? 'status-success' : 'status-error'}`}>
                <span>{saveStatus.success ? '✓' : '⚠️'}</span>
                <span>{saveStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
