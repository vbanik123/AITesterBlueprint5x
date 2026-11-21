// api/index.js - Vercel Serverless Function Entrypoint
const fs = require('fs');
const path = require('path');

// Fallback hardcoded defaults from project configuration
const DEFAULT_CONFIG = {
  jiraUrl: "https://vijaykbanik.atlassian.net/",
  jiraEmail: "vijay.k.banik@gmail.com",
  jiraApiToken: "ATATT3xFfGF0Y4UKf7m8ZJgaBufGq4-AKoI4D0u1CVSQCBiS8t-mcIPCvXRVrWrGW1SnGKR7UOIgmOOIiGityWiVwJ6sfic_Z_c7TuJ97V-EGQU1pEa7MGh2fUAgGn5A8gwN7U7nLn1EJ7gtzpFu-13niQs4Gyg3pJP3NBfn4HClB5am6VG4-I0=185A1AF5",
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: 'qwen/qwen3.8-27b',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3',
  preferredProvider: 'groq'
};

// In-memory runtime state for serverless execution
let runtimeConfig = { ...DEFAULT_CONFIG };

function getActiveConfig(override = {}) {
  return {
    jiraUrl: override.jiraUrl || process.env.JIRA_URL || runtimeConfig.jiraUrl,
    jiraEmail: override.jiraEmail || process.env.JIRA_EMAIL || runtimeConfig.jiraEmail,
    jiraApiToken: override.jiraApiToken || process.env.JIRA_API_TOKEN || runtimeConfig.jiraApiToken,
    groqApiKey: override.groqApiKey || process.env.GROQ_API_KEY || runtimeConfig.groqApiKey,
    groqModel: override.groqModel || process.env.GROQ_MODEL || runtimeConfig.groqModel,
    ollamaUrl: override.ollamaUrl || process.env.OLLAMA_URL || runtimeConfig.ollamaUrl,
    ollamaModel: override.ollamaModel || process.env.OLLAMA_MODEL || runtimeConfig.ollamaModel,
    preferredProvider: override.preferredProvider || runtimeConfig.preferredProvider || 'groq'
  };
}

function maskSecret(str) {
  if (!str) return '';
  if (str.length <= 8) return '********';
  return str.slice(0, 4) + '...' + str.slice(-4);
}

function getMaskedConfig(conf) {
  return {
    jiraUrl: conf.jiraUrl,
    jiraEmail: conf.jiraEmail,
    jiraApiTokenMasked: maskSecret(conf.jiraApiToken),
    hasJiraToken: Boolean(conf.jiraApiToken),
    groqApiKeyMasked: maskSecret(conf.groqApiKey),
    hasGroqKey: Boolean(conf.groqApiKey),
    groqModel: conf.groqModel,
    ollamaUrl: conf.ollamaUrl,
    ollamaModel: conf.ollamaModel,
    preferredProvider: conf.preferredProvider
  };
}

// Jira Helpers
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
    return { success: false, error: 'Missing required Jira credentials (URL, Email, or API Token).' };
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
      } catch (e) { }
      return { success: false, error: `Jira connection failed: ${errDetail}` };
    }
  } catch (err) {
    return { success: false, error: `Network or host error reaching Jira: ${err.message}` };
  }
}

async function fetchJiraIssue(issueKey, config) {
  const cleanKey = (issueKey || '').trim().toUpperCase();
  if (!cleanKey) {
    throw new Error('Please provide a Jira Issue Key (e.g. QA-123 or PROJ-1).');
  }

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
    throw new Error('Jira credentials are not fully configured in settings or environment.');
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

  if (!res.ok && res.status === 404) {
    const v2Res = await fetch(`${base}/rest/api/2/issue/${cleanKey}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });
    if (v2Res.ok) res = v2Res;
  }

  if (!res.ok) {
    let msg = `Jira API error (${res.status} ${res.statusText})`;
    if (res.status === 401) {
      msg = 'Authentication failed. Please check your Jira Email and API Token.';
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
    } catch (e) { }
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

  return {
    key: data.key || cleanKey,
    summary: fields.summary || 'No summary provided',
    description: descText.trim() || 'No description provided in Jira ticket',
    status: fields.status?.name || 'Unknown',
    priority: fields.priority?.name || 'Medium',
    issueType: fields.issuetype?.name || 'Story',
    components: (fields.components || []).map(c => c.name),
    rawUrl: `${base}/browse/${data.key || cleanKey}`,
    isMock: false
  };
}

// LLM Helpers
async function testGroqConnection(apiKey, model = 'qwen/qwen3.8-27b') {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'Groq API Key is missing.' };
  }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'qwen/qwen3.8-27b',
        messages: [{ role: 'user', content: 'Say "Groq connected successfully" in 4 words.' }],
        max_tokens: 15,
        temperature: 0.1
      })
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || 'Connected';
      return { success: true, message: reply, model: data.model || model };
    } else {
      let detail = `${res.status} ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.error?.message) detail = errJson.error.message;
      } catch (e) { }
      return { success: false, error: `Groq API Error: ${detail}` };
    }
  } catch (err) {
    return { success: false, error: `Network error connecting to Groq: ${err.message}` };
  }
}

const TEST_PLAN_TEMPLATE = `# Test Plan — <JIRA-KEY>: <title>

> Status: **DRAFT — pending human review.** Not approved until a QA owner signs off.

## 1. Scope & Objectives
- **In scope:**
- **Out of scope:**
- **Objective:** what "tested" means for this ticket.

## 2. Gaps & Questions for the author
| # | Area | Finding (⚠️/❌) | Question to author |
|---|------|----------------|--------------------|
| 1 |      |                |                    |

## 3. Test Scenarios
| ID | Priority | Type (pos/neg/boundary) | Scenario | Maps to (AC / gap) |
|----|----------|-------------------------|----------|--------------------|
| TS-1 | P0 |                       |          |                    |

## 4. Test Data & Environment
- **Data:**
- **Environment / flags:**
- **Roles / permissions:**

## 5. Risks & Assumptions
- **Assumptions made:**
- **Risks:**

## 6. Entry / Exit criteria
- **Entry:**
- **Exit:**

## 7. Resource Allocation

## 8. Timelines, Sprint Details


---
## HUMAN REVIEW GATE
- **I assumed:** …
- **I could not confirm:** …
- **Open questions blocking sign-off:** …
- **Approve, or edit, before I write test cases / automation.`;

function buildRicepotPrompt(jiraIssue) {
  return `### R — Role
Act as an expert QA automation architect and senior test lead. You are creating a professional functional test plan for a Jira issue using the approved Test Plan Template.

### I — Instructions
1. Review the Jira Issue data provided in Context.
2. Generate a comprehensive test plan following the exact section headers, order, and structure of the supplied Test Plan Template.
3. Every factual claim about application behavior must be traceable to the retrieved Jira content.
4. If information is missing, unclear, or unspecified in the Jira issue (e.g. environment, browser support, specific error copy, timelines), respond exactly with: "Insufficient information to determine."
5. If a detail is inferred, label it exactly: "Inference (low confidence)".
6. Do NOT invent features, APIs, error messages, password policies, or system behavior.
7. Separate verified requirements from proposed test scenarios.
8. Complete the HUMAN REVIEW GATE at the bottom with all assumptions and unconfirmed items.

### C — Context
Jira Issue Key: ${jiraIssue.key}
Summary: ${jiraIssue.summary}
Issue Type: ${jiraIssue.issueType}
Priority: ${jiraIssue.priority}
Status: ${jiraIssue.status}
Components: ${(jiraIssue.components || []).join(', ') || 'Insufficient information to determine.'}
Description & Requirements:
${jiraIssue.description}

Approved Template to follow exactly:
${TEST_PLAN_TEMPLATE}

### P — Parameters
- Deterministic, professional, markdown format.
- Exactly match the 8 sections and the HUMAN REVIEW GATE in the template.
- Do not output preamble or commentary. Begin directly with "# Test Plan — ${jiraIssue.key}: ${jiraIssue.summary}".`;
}

function generateDeterministicPlan(jiraIssue) {
  const key = jiraIssue.key;
  const title = jiraIssue.summary;

  return `# Test Plan — ${key}: ${title}

> Status: **DRAFT — pending human review.** Not approved until a QA owner signs off.

## 1. Scope & Objectives
- **In scope:** 
  - Functional verification of ${title} as specified in Jira ticket ${key}.
  - Validation of user acceptance criteria and expected outcomes based on documented requirements.
  - Positive, negative, and boundary test scenarios directly derivable from ticket description.
- **Out of scope:** 
  - Performance, stress, and load testing (Insufficient information to determine).
  - Third-party SSO and security penetration testing unless explicitly mandated.
  - Localization and accessibility compliance (Insufficient information to determine).
- **Objective:** What "tested" means for this ticket:
  - Verified that all explicit requirements in ${key} execute successfully without regressions.
  - Documented edge cases, input validation, and boundary conditions fail safely with proper messaging.

## 2. Gaps & Questions for the author
| # | Area | Finding (⚠️/❌) | Question to author |
|---|------|----------------|--------------------|
| 1 | Validation Messages | ⚠️ Validation error copy not fully specified | What exact error messages should be displayed on invalid input? |
| 2 | Target Environment | ⚠️ Test environment details omitted | Which QA/staging environment, build, and browser matrix should be targeted? |
| 3 | Permissions / Roles | ⚠️ User permissions not documented | Are there specific user roles or permission gates required for this feature? |

## 3. Test Scenarios
| ID | Priority | Type (pos/neg/boundary) | Scenario | Maps to (AC / gap) |
|----|----------|-------------------------|----------|--------------------|
| TS-1 | P0 | Positive | Verify successful execution of ${title} with valid standard inputs | AC-1 / Main Flow |
| TS-2 | P0 | Negative | Verify appropriate rejection and handling when invalid data or credentials are supplied | AC-2 / Rejection |
| TS-3 | P1 | Boundary | Verify behavior when mandatory fields are left blank or contain whitespace | AC-3 / Mandatory Fields |
| TS-4 | P1 | Boundary | Verify maximum and minimum character length limits on all input fields | Gap #1 / Boundary |
| TS-5 | P2 | Negative | Verify system recovery and session stability on network interruption or timeout | Gap #2 / Resilience |

## 4. Test Data & Environment
- **Data:** Valid registered test credentials and invalid test datasets. Specific test data requirements: Insufficient information to determine.
- **Environment / flags:** Staging / QA environment. Specific URL and feature flags: Insufficient information to determine.
- **Roles / permissions:** Standard authenticated user role. Special privileges: Insufficient information to determine.

## 5. Risks & Assumptions
- **Assumptions made:** 
  - Assumed standard client-side validation prevents submission of empty mandatory fields. (Inference (low confidence))
  - Assumed backend APIs enforce identical authorization and validation rules as the frontend. (Inference (low confidence))
- **Risks:** 
  - Missing exact error message copy may lead to ambiguous defect reporting.
  - Unspecified edge cases could cause unexpected production behavior.

## 6. Entry / Exit criteria
- **Entry:** 
  - Feature deployed to designated QA test environment.
  - Test data and active credentials provisioned.
  - Smoke test passes for the primary user flow.
- **Exit:** 
  - 100% of P0 and P1 test scenarios executed.
  - Zero open Critical (P0) or Major (P1) defects.
  - QA sign-off recorded.

## 7. Resource Allocation
- Insufficient information to determine. (Assigned QA Engineer: Pending sprint assignment)

## 8. Timelines, Sprint Details
- Insufficient information to determine. (Target Sprint / Release: Subject to engineering schedule)


---
## HUMAN REVIEW GATE
- **I assumed:** Standard web application security and input validation behavior for missing requirements.
- **I could not confirm:** Exact validation text copy, target browser versions, and feature flag names.
- **Open questions blocking sign-off:** Please review the questions in Section 2 (Gaps & Questions for author).
- **Approve, or edit, before I write test cases / automation.`;
}

async function generateTestPlan(jiraIssue, llmConfig) {
  const prompt = buildRicepotPrompt(jiraIssue);
  const provider = llmConfig.provider || 'groq';

  if (provider === 'groq' && llmConfig.groqApiKey) {
    try {
      const model = llmConfig.groqModel || 'qwen/qwen3.8-27b';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llmConfig.groqApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert QA Automation Architect. Follow the exact user instructions, template headers, and RICE-POT constraints strictly without preamble.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 3000
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return { testPlan: content, provider: `Groq (${model})`, usedFallback: false };
        }
      }
    } catch (err) {
      console.warn('Groq generation warning:', err.message);
    }
  }

  return {
    testPlan: generateDeterministicPlan(jiraIssue),
    provider: 'Deterministic Fallback Engine (RICE-POT Template)',
    usedFallback: true
  };
}

// Main Vercel Serverless Request Handler
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Parse Body if needed
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { }
  } else if (!req.body && req.method === 'POST') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
      });
      req.on('error', () => resolve({}));
    });
  }

  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  const send = (status, obj) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };

  try {
    // 1. GET /api/config
    if (pathname === '/api/config' || pathname.endsWith('/config')) {
      const conf = getActiveConfig(body.customConfig || {});
      return send(200, { success: true, config: getMaskedConfig(conf) });
    }

    // 2. POST /api/settings
    if (pathname === '/api/settings' || pathname.endsWith('/settings')) {
      if (body.jiraUrl !== undefined) runtimeConfig.jiraUrl = body.jiraUrl;
      if (body.jiraEmail !== undefined) runtimeConfig.jiraEmail = body.jiraEmail;
      if (body.jiraApiToken && !body.jiraApiToken.includes('...')) runtimeConfig.jiraApiToken = body.jiraApiToken;
      if (body.groqApiKey && !body.groqApiKey.includes('...')) runtimeConfig.groqApiKey = body.groqApiKey;
      if (body.groqModel) runtimeConfig.groqModel = body.groqModel;
      if (body.preferredProvider) runtimeConfig.preferredProvider = body.preferredProvider;

      return send(200, {
        success: true,
        message: 'Settings saved in runtime memory.',
        config: getMaskedConfig(runtimeConfig)
      });
    }

    // 3. POST /api/jira/test-connection
    if (pathname.includes('/jira/test-connection')) {
      const conf = getActiveConfig(body);
      const result = await testJiraConnection(conf);
      return send(result.success ? 200 : 400, result);
    }

    // 4. POST /api/llm/test
    if (pathname.includes('/llm/test')) {
      const conf = getActiveConfig(body);
      const key = (body.groqApiKey && !body.groqApiKey.includes('...')) ? body.groqApiKey : conf.groqApiKey;
      const result = await testGroqConnection(key, body.groqModel || conf.groqModel);
      return send(result.success ? 200 : 400, result);
    }

    // 5. POST /api/generate
    if (pathname === '/api/generate' || pathname.endsWith('/generate')) {
      const issueKey = (body.issueKey || '').trim();
      if (!issueKey) {
        return send(400, { success: false, error: 'Please enter a Jira Issue ID.' });
      }

      // Merge active config with any client-supplied credentials (e.g. from user entered env)
      const activeConf = getActiveConfig(body.customConfig || {});

      let jiraIssue;
      try {
        jiraIssue = await fetchJiraIssue(issueKey, activeConf);
      } catch (jiraErr) {
        return send(400, { success: false, error: `Jira Retrieval Error: ${jiraErr.message}` });
      }

      const planResult = await generateTestPlan(jiraIssue, activeConf);

      return send(200, {
        success: true,
        issueKey: jiraIssue.key,
        jiraIssue,
        testPlan: planResult.testPlan,
        provider: planResult.provider,
        usedFallback: planResult.usedFallback
      });
    }

    return send(404, { success: false, error: `Endpoint ${pathname} not found` });
  } catch (err) {
    return send(500, { success: false, error: err.message });
  }
};
