// server.js - Lightweight, zero-dependency Node.js HTTP Server & API

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { testJiraConnection, fetchJiraIssue } = require('./jiraService');
const { testGroqConnection, testOllamaConnection, generateTestPlan } = require('./llmService');

// 1. Locate and load .env file from current or parent directories
function loadEnvironment() {
  const searchRoots = [__dirname, process.cwd()];
  for (const root of searchRoots) {
    let curr = root;
    for (let i = 0; i < 10; i++) {
      const candidate = path.join(curr, '.env');
      if (fs.existsSync(candidate)) {
        try {
          if (typeof process.loadEnvFile === 'function') {
            process.loadEnvFile(candidate);
          } else {
            const lines = fs.readFileSync(candidate, 'utf-8').split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [k, ...v] = trimmed.split('=');
                const key = k.trim();
                const val = v.join('=').trim().replace(/^["']|["']$/g, '');
                if (!process.env[key]) process.env[key] = val;
              }
            }
          }
          console.log(`[Config] Loaded environment variables from: ${candidate}`);
          return candidate;
        } catch (e) {
          console.warn(`[Config] Failed reading .env at ${candidate}:`, e.message);
        }
      }
      const parent = path.dirname(curr);
      if (parent === curr) break;
      curr = parent;
    }
  }
  console.log('[Config] No .env file found in parent hierarchy; using system environment variables.');
  return null;
}

loadEnvironment();

// Active in-memory settings state initialized from environment
const appConfig = {
  jiraUrl: process.env.JIRA_URL || '',
  jiraEmail: process.env.JIRA_EMAIL || '',
  jiraApiToken: process.env.JIRA_API_TOKEN || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3',
  preferredProvider: 'groq'
};

function maskSecret(str) {
  if (!str) return '';
  if (str.length <= 8) return '********';
  return str.slice(0, 4) + '...' + str.slice(-4);
}

function getMaskedConfig() {
  return {
    jiraUrl: appConfig.jiraUrl,
    jiraEmail: appConfig.jiraEmail,
    jiraApiTokenMasked: maskSecret(appConfig.jiraApiToken),
    hasJiraToken: Boolean(appConfig.jiraApiToken),
    groqApiKeyMasked: maskSecret(appConfig.groqApiKey),
    hasGroqKey: Boolean(appConfig.groqApiKey),
    groqModel: appConfig.groqModel,
    ollamaUrl: appConfig.ollamaUrl,
    ollamaModel: appConfig.ollamaModel,
    preferredProvider: appConfig.preferredProvider
  };
}

// Helpers for JSON response and request body parsing
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

// Static file serving for Frontend
const FRONTEND_DIR = path.resolve(__dirname, '../frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res) {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(FRONTEND_DIR, reqPath);

  // Security: prevent path traversal outside FRONTEND_DIR
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  // Fallback to index.html for Single-Page Application routing
  const indexPath = path.join(FRONTEND_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(indexPath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

// Main HTTP request router
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // --- API Endpoints ---
  try {
    // 1. Get current configuration
    if (req.method === 'GET' && pathname === '/api/config') {
      return sendJson(res, 200, { success: true, config: getMaskedConfig() });
    }

    // 2. Update configuration
    if (req.method === 'POST' && pathname === '/api/settings') {
      const body = await parseJsonBody(req);
      if (body.jiraUrl !== undefined) appConfig.jiraUrl = body.jiraUrl;
      if (body.jiraEmail !== undefined) appConfig.jiraEmail = body.jiraEmail;
      if (body.jiraApiToken && !body.jiraApiToken.includes('...')) {
        appConfig.jiraApiToken = body.jiraApiToken;
      }
      if (body.groqApiKey && !body.groqApiKey.includes('...')) {
        appConfig.groqApiKey = body.groqApiKey;
      }
      if (body.groqModel) appConfig.groqModel = body.groqModel;
      if (body.ollamaUrl !== undefined) appConfig.ollamaUrl = body.ollamaUrl;
      if (body.ollamaModel !== undefined) appConfig.ollamaModel = body.ollamaModel;
      if (body.preferredProvider) appConfig.preferredProvider = body.preferredProvider;

      return sendJson(res, 200, {
        success: true,
        message: 'Settings updated successfully.',
        config: getMaskedConfig()
      });
    }

    // 3. Test Jira connection
    if (req.method === 'POST' && pathname === '/api/jira/test-connection') {
      const body = await parseJsonBody(req);
      const testConfig = {
        jiraUrl: body.jiraUrl || appConfig.jiraUrl,
        jiraEmail: body.jiraEmail || appConfig.jiraEmail,
        jiraApiToken: (body.jiraApiToken && !body.jiraApiToken.includes('...')) ? body.jiraApiToken : appConfig.jiraApiToken
      };
      const result = await testJiraConnection(testConfig);
      return sendJson(res, result.success ? 200 : 400, result);
    }

    // 4. Test LLM connection
    if (req.method === 'POST' && pathname === '/api/llm/test') {
      const body = await parseJsonBody(req);
      const provider = body.provider || 'groq';

      if (provider === 'groq') {
        const key = (body.groqApiKey && !body.groqApiKey.includes('...')) ? body.groqApiKey : appConfig.groqApiKey;
        const result = await testGroqConnection(key, body.groqModel || appConfig.groqModel);
        return sendJson(res, result.success ? 200 : 400, result);
      } else if (provider === 'ollama') {
        const url = body.ollamaUrl || appConfig.ollamaUrl;
        const result = await testOllamaConnection(url);
        return sendJson(res, result.success ? 200 : 400, result);
      } else {
        return sendJson(res, 400, { success: false, error: 'Unknown LLM provider' });
      }
    }

    // 5. Fetch Jira Issue Only
    if (req.method === 'POST' && pathname === '/api/jira/issue') {
      const body = await parseJsonBody(req);
      const issueKey = body.issueKey;
      if (!issueKey) {
        return sendJson(res, 400, { success: false, error: 'Issue Key is required.' });
      }
      const issue = await fetchJiraIssue(issueKey, appConfig);
      return sendJson(res, 200, { success: true, issue });
    }

    // 6. Generate Test Plan (Full Workflow: Fetch Jira -> Generate via LLM)
    if (req.method === 'POST' && pathname === '/api/generate') {
      const body = await parseJsonBody(req);
      const issueKey = (body.issueKey || '').trim();

      if (!issueKey) {
        return sendJson(res, 400, { success: false, error: 'Please enter a Jira Issue ID.' });
      }

      console.log(`[Generate] Processing Jira issue: ${issueKey}`);
      // 1. Fetch Jira data
      let jiraIssue;
      try {
        jiraIssue = await fetchJiraIssue(issueKey, appConfig);
      } catch (jiraErr) {
        return sendJson(res, 400, {
          success: false,
          error: `Jira Retrieval Error: ${jiraErr.message}`
        });
      }

      // 2. Generate Plan with LLM
      const llmConf = {
        provider: body.provider || appConfig.preferredProvider,
        groqApiKey: appConfig.groqApiKey,
        groqModel: appConfig.groqModel,
        ollamaUrl: appConfig.ollamaUrl,
        ollamaModel: appConfig.ollamaModel
      };

      const planResult = await generateTestPlan(jiraIssue, llmConf);

      return sendJson(res, 200, {
        success: true,
        issueKey: jiraIssue.key,
        jiraIssue,
        testPlan: planResult.testPlan,
        provider: planResult.provider,
        usedFallback: planResult.usedFallback,
        fallbackNotice: planResult.fallbackNotice
      });
    }

    // If not an API route, serve static frontend
    return serveStatic(req, res);
  } catch (error) {
    console.error('[Server Error]', error);
    return sendJson(res, 500, {
      success: false,
      error: `Internal Server Error: ${error.message}`
    });
  }
});

const PORT = parseInt(process.env.PORT || '3000', 10);

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  AI Test Planning Agent Server is Running!           `);
    console.log(`  Local URL:   http://localhost:${PORT}               `);
    console.log(`  Frontend:    http://localhost:${PORT}/index.html     `);
    console.log(`  Health API:  http://localhost:${PORT}/api/config     `);
    console.log(`=======================================================`);
  });
}

module.exports = { server, appConfig };
