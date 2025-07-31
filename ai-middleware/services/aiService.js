const fetch = require('node-fetch');
const handleIntent = require('./intentHandler');

// Simple response cache to avoid repeated AI calls
const responseCache = new Map();

// Session-based prompt optimization - send instructions only once
const sessionInstructions = new Set();

// System prompt that gets sent only once per session
const SYSTEM_PROMPT = `You are FleetPro AI, a helpful assistant. You can help with:
- General questions and conversations
- Fleet management (trucks, shipments, drivers, tracking)
- Math calculations
- Any other topics

For fleet-related questions, use this format:
{"action": "yes", "intent": "cancel_shipment", "parameters": {"truck_id": "123"}}

For general conversation, use this format:
{"action": "no", "response": "your helpful response"}

Always be friendly and helpful. If it's fleet-related, mention your fleet capabilities. If not, just be helpful and conversational.`;

async function getAIResponse(userMessage, sessionId = 'default') {
  try {
    console.log('Processing message with Ollama AI:', userMessage);
    
    // Check cache first for exact matches
    if (responseCache.has(userMessage.toLowerCase().trim())) {
      const cachedResponse = responseCache.get(userMessage.toLowerCase().trim());
      console.log('Using cached response:', cachedResponse);
      return cachedResponse;
    }
    
    // Quick fallback for simple math
    const message = userMessage.toLowerCase().trim();
    if (message.includes('+') || message.includes('-') || message.includes('*') || message.includes('/')) {
      try {
        const mathResult = eval(message.replace(/[^0-9+\-*/().]/g, ''));
        const response = `The answer is ${mathResult}. I'm FleetPro AI - I can also help you with fleet management tasks! What would you like to do?`;
        responseCache.set(message, response);
        return response;
      } catch (e) {
        // Fall through to AI if math fails
      }
    }
    
    // Optimize prompt - send instructions only once per session
    let prompt;
    if (!sessionInstructions.has(sessionId)) {
      prompt = `${SYSTEM_PROMPT}\n\nThe user asked: "${userMessage}"`;
      sessionInstructions.add(sessionId);
    } else {
      prompt = `The user asked: "${userMessage}"`;
    }

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.8,
          num_predict: 100
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.response.trim();
    
    console.log('Raw Ollama response:', aiResponse);
    
    // Clean up JSON
    let cleanedContent = aiResponse;
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const jsonStart = cleanedContent.indexOf('{');
    const jsonEnd = cleanedContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
    }
    
    console.log('Cleaned JSON:', cleanedContent);
    
    try {
      const parsed = JSON.parse(cleanedContent);
      
      if (parsed.action === "yes" && parsed.intent && parsed.parameters) {
        console.log('Detected intent:', parsed.intent);
        console.log('Extracted parameters:', parsed.parameters);
        
        const result = await handleIntent(parsed.intent, parsed.parameters);
        responseCache.set(message, result);
        return result;
      } else if (parsed.action === "no" && parsed.response) {
        console.log('Conversational response:', parsed.response);
        responseCache.set(message, parsed.response);
        return parsed.response;
      } else {
        throw new Error('Invalid response structure from AI');
      }
    } catch (parseError) {
      // If JSON parsing fails, use the raw response
      console.log('Using raw AI response');
      responseCache.set(message, aiResponse);
      return aiResponse;
    }
    
  } catch (error) {
    console.error('Error processing AI response:', error.message);
    
    // Simple fallback for common questions
    const message = userMessage.toLowerCase().trim();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const response = "Hello! I'm FleetPro AI. I can help with trucks, drivers, shipments, and tracking. What do you need?";
      responseCache.set(message, response);
      return response;
    }
    
    if (message.includes('kashmir')) {
      const response = "Kashmir is a region in the northern part of the Indian subcontinent, between India, Pakistan, and China. It's known for its beautiful mountains and valleys. I'm FleetPro AI - I can also help you with fleet management if you need it!";
      responseCache.set(message, response);
      return response;
    }
    
    if (message.includes('truck') && message.includes('where')) {
      const truckMatch = message.match(/truck\s*(\d+)/);
      if (truckMatch) {
        return handleIntent('track_order', { truck_id: truckMatch[1] });
      }
    }
    
    // Default helpful response
    const response = "I'm FleetPro AI, your helpful assistant! I can answer questions and help with fleet management. What would you like to know?";
    responseCache.set(message, response);
    return response;
  }
}

// New streaming function for real-time responses
async function* streamAIResponse(userMessage, sessionId = 'default') {
  try {
    console.log('Starting streaming response for:', userMessage);
    
    // Check cache first
    if (responseCache.has(userMessage.toLowerCase().trim())) {
      const cachedResponse = responseCache.get(userMessage.toLowerCase().trim());
      console.log('Using cached response for streaming');
      yield cachedResponse;
      return;
    }
    
    // Quick math check
    const message = userMessage.toLowerCase().trim();
    if (message.includes('+') || message.includes('-') || message.includes('*') || message.includes('/')) {
      try {
        const mathResult = eval(message.replace(/[^0-9+\-*/().]/g, ''));
        const response = `The answer is ${mathResult}. I'm FleetPro AI - I can also help you with fleet management tasks! What would you like to do?`;
        responseCache.set(message, response);
        yield response;
        return;
      } catch (e) {
        // Fall through to AI if math fails
      }
    }
    
    // Optimize prompt - send instructions only once per session
    let prompt;
    if (!sessionInstructions.has(sessionId)) {
      prompt = `${SYSTEM_PROMPT}\n\nThe user asked: "${userMessage}"`;
      sessionInstructions.add(sessionId);
    } else {
      prompt = `The user asked: "${userMessage}"`;
    }

    console.log('Sending prompt to Ollama:', prompt);

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.3,
          top_p: 0.8,
          num_predict: 100
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    console.log('Ollama streaming response received, status:', response.status);

    let fullResponse = '';
    const reader = response.body;
    
    if (!reader) {
      throw new Error('No response body reader available');
    }

    console.log('Starting to read streaming chunks...');
    
    for await (const chunk of reader) {
      const chunkText = chunk.toString();
      console.log('Raw chunk received:', chunkText);
      
      const lines = chunkText.split('\n');
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            // Ollama sends raw JSON objects, not data: prefixed
            const data = JSON.parse(line);
            console.log('Parsed data:', data);
            
            if (data.response) {
              console.log('Yielding response chunk:', data.response);
              fullResponse += data.response;
              yield data.response;
            }
            if (data.done) {
              console.log('Stream completed');
              break;
            }
          } catch (e) {
            console.log('Failed to parse JSON line:', line, 'Error:', e.message);
            // Skip invalid JSON lines
          }
        }
      }
    }
    
    // Process the complete response for intent detection
    console.log('Complete streamed response:', fullResponse);
    
    if (!fullResponse.trim()) {
      console.log('No response received from Ollama, using fallback');
      const fallback = "Hello! I'm FleetPro AI. I can help with trucks, drivers, shipments, and tracking. What do you need?";
      yield fallback;
      return;
    }
    
    // Try to parse as JSON for intent detection
    try {
      const jsonStart = fullResponse.indexOf('{');
      const jsonEnd = fullResponse.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonContent = fullResponse.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonContent);
        
        if (parsed.action === "yes" && parsed.intent && parsed.parameters) {
          console.log('Detected intent from stream:', parsed.intent);
          const result = await handleIntent(parsed.intent, parsed.parameters);
          responseCache.set(message, result);
          // Don't yield here as we already yielded the stream
          return;
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, the streamed response is already good
      console.log('Using streamed response as-is');
    }
    
    responseCache.set(message, fullResponse);
    
  } catch (error) {
    console.error('Error in streaming AI response:', error.message);
    
    // Fallback response
    const fallback = "I'm having trouble processing that right now. Can you try rephrasing your question?";
    yield fallback;
  }
}

module.exports = { getAIResponse, streamAIResponse };

