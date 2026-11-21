// llmService.js - Groq and Ollama LLM Integrations for Test Plan Generation

const { buildRicepotPrompt, generateDeterministicPlan } = require('./templateService');

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
      } catch (e) {}
      return { success: false, error: `Groq API Error: ${detail}` };
    }
  } catch (err) {
    return { success: false, error: `Network error connecting to Groq: ${err.message}` };
  }
}

async function testOllamaConnection(ollamaUrl = 'http://localhost:11434') {
  const base = (ollamaUrl || 'http://localhost:11434').replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}/api/tags`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map(m => m.name);
      return {
        success: true,
        message: models.length ? `Connected. Available models: ${models.join(', ')}` : 'Connected (No models downloaded yet).',
        models
      };
    } else {
      return { success: false, error: `Ollama returned status ${res.status} ${res.statusText}` };
    }
  } catch (err) {
    return { success: false, error: `Could not reach Ollama at ${base} (${err.message}). Make sure Ollama is running.` };
  }
}

async function generateTestPlan(jiraIssue, llmConfig) {
  const prompt = buildRicepotPrompt(jiraIssue);
  const provider = llmConfig.provider || 'groq'; // 'groq' | 'ollama' | 'mock'

  // If mock mode is explicitly chosen or if no keys available
  if (provider === 'mock' || (!llmConfig.groqApiKey && provider === 'groq' && !llmConfig.ollamaUrl)) {
    return {
      testPlan: generateDeterministicPlan(jiraIssue),
      provider: 'Deterministic Fallback Engine (RICE-POT Rules Applied)',
      usedFallback: true
    };
  }

  // 1. Try Groq
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
          return {
            testPlan: content,
            provider: `Groq (${model})`,
            usedFallback: false
          };
        }
      } else {
        console.warn('Groq generation failed with status', res.status, await res.text());
      }
    } catch (err) {
      console.warn('Groq connection error:', err.message);
    }
  }

  // 2. Try Ollama
  if (provider === 'ollama' && llmConfig.ollamaUrl) {
    try {
      const base = llmConfig.ollamaUrl.replace(/\/+$/, '');
      const model = llmConfig.ollamaModel || 'llama3';
      const res = await fetch(`${base}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: { temperature: 0.2 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          return {
            testPlan: data.response.trim(),
            provider: `Ollama (${model})`,
            usedFallback: false
          };
        }
      }
    } catch (err) {
      console.warn('Ollama connection error:', err.message);
    }
  }

  // 3. Deterministic Fallback if network or LLM fails
  return {
    testPlan: generateDeterministicPlan(jiraIssue),
    provider: 'Deterministic Fallback Engine (RICE-POT Template)',
    usedFallback: true,
    fallbackNotice: 'AI Provider was unreachable or returned an error. Generated using standard RICE-POT template engine.'
  };
}

module.exports = {
  testGroqConnection,
  testOllamaConnection,
  generateTestPlan
};
