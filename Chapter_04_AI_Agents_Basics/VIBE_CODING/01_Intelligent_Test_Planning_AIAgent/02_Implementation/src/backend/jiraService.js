// jiraService.js - Lightweight, zero-dependency Jira Cloud Integration

function extractTextFromADF(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromADF).join('\n');
  }
  return '';
}

function cleanJiraUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url.replace(/\/+$/, '');
}

async function testJiraConnection(config) {
  const { jiraUrl, jiraEmail, jiraApiToken } = config;

  if (!jiraUrl || !jiraEmail || !jiraApiToken) {
    return {
      success: false,
      error: 'Missing required Jira credentials (URL, Email, or API Token).'
    };
  }

  const base = cleanJiraUrl(jiraUrl);
  const auth = Buffer.from(`${jiraEmail.trim()}:${jiraApiToken.trim()}`).toString('base64');

  try {
    const res = await fetch(`${base}/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        displayName: data.displayName || data.emailAddress,
        email: data.emailAddress,
        active: data.active
      };
    } else {
      let errDetail = `${res.status} ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.errorMessages && errJson.errorMessages.length) {
          errDetail = errJson.errorMessages.join('; ');
        }
      } catch (e) {}
      return {
        success: false,
        error: `Jira connection failed: ${errDetail}`
      };
    }
  } catch (err) {
    return {
      success: false,
      error: `Network or host error reaching Jira: ${err.message}`
    };
  }
}

async function fetchJiraIssue(issueKey, config) {
  const cleanKey = (issueKey || '').trim().toUpperCase();
  if (!cleanKey) {
    throw new Error('Please provide a Jira Issue Key (e.g. QA-123 or PROJ-1).');
  }

  // Support demo mock for offline testing if configured or if requested
  if (cleanKey.startsWith('MOCK-') || cleanKey === 'DEMO-101') {
    return {
      key: cleanKey,
      summary: 'User Authentication and Dashboard Redirection with SSO',
      description: 'As a registered customer, I want to securely log in with my email and password so that I can access my personalized dashboard.\n\nAcceptance Criteria:\n1. Registered users can log in with valid credentials.\n2. Invalid credentials must display error and prevent dashboard access.\n3. Mandatory email and password validation.\n4. Session remains active for 30 minutes.',
      status: 'Ready for Testing',
      priority: 'High',
      issueType: 'Story',
      components: ['Authentication', 'Dashboard'],
      rawUrl: `${cleanJiraUrl(config.jiraUrl)}/browse/${cleanKey}`,
      isMock: true
    };
  }

  const { jiraUrl, jiraEmail, jiraApiToken } = config;
  if (!jiraUrl || !jiraEmail || !jiraApiToken) {
    throw new Error('Jira credentials are not fully configured in settings or .env file.');
  }

  const base = cleanJiraUrl(jiraUrl);
  const auth = Buffer.from(`${jiraEmail.trim()}:${jiraApiToken.trim()}`).toString('base64');

  let res = await fetch(`${base}/rest/api/3/issue/${cleanKey}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  });

  // Fallback to v2 API if v3 returned 404 or unsupported
  if (!res.ok && res.status === 404) {
    const v2Res = await fetch(`${base}/rest/api/2/issue/${cleanKey}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });
    if (v2Res.ok) {
      res = v2Res;
    }
  }

  if (!res.ok) {
    let msg = `Jira API error (${res.status} ${res.statusText})`;
    if (res.status === 401) {
      msg = 'Authentication failed. Please verify your Jira Email and API Token.';
    } else if (res.status === 403) {
      msg = 'Permission denied. The account does not have read access to this Jira issue.';
    } else if (res.status === 404) {
      msg = `Jira issue "${cleanKey}" not found in project at ${base}.`;
    }
    try {
      const errJson = await res.json();
      if (errJson.errorMessages && errJson.errorMessages.length) {
        msg += `: ${errJson.errorMessages.join('; ')}`;
      }
    } catch (e) {}
    throw new Error(msg);
  }

  const data = await res.json();
  const fields = data.fields || {};

  let descText = '';
  if (typeof fields.description === 'string') {
    descText = fields.description;
  } else if (fields.description && typeof fields.description === 'object') {
    descText = extractTextFromADF(fields.description);
  }

  // Look for acceptance criteria in custom fields
  let acceptanceCriteria = '';
  for (const [key, val] of Object.entries(fields)) {
    if (key.startsWith('customfield_') && typeof val === 'string' && val.length > 5) {
      if (key.toLowerCase().includes('acceptance') || val.toLowerCase().includes('acceptance criteria')) {
        acceptanceCriteria += `\n${val}`;
      }
    }
  }

  return {
    key: data.key || cleanKey,
    summary: fields.summary || 'No summary provided',
    description: descText.trim() || 'No description provided in Jira ticket',
    status: fields.status?.name || 'Unknown',
    priority: fields.priority?.name || 'Medium',
    issueType: fields.issuetype?.name || 'Story',
    components: (fields.components || []).map(c => c.name),
    acceptanceCriteria: acceptanceCriteria.trim(),
    rawUrl: `${base}/browse/${data.key || cleanKey}`,
    isMock: false
  };
}

module.exports = {
  testJiraConnection,
  fetchJiraIssue,
  cleanJiraUrl
};
