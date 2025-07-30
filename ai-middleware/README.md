# AI Middleware with Local LLM

This Node.js middleware acts as an AI layer between your React frontend chatbot and backend APIs (Laravel/Rails). It uses **Ollama** to run local LLMs for intent recognition and parameter extraction.

## Features

- 🤖 Local LLM integration using Ollama (no API costs!)
- 🎯 Intent recognition and parameter extraction
- 🔄 JSON-based communication with frontend/backend
- ⚡ Fast local processing
- 🛡️ Privacy-focused (no data sent to external APIs)

## Prerequisites

### 1. Install Ollama

**On Linux/macOS:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**On Windows:**
Download from [ollama.ai](https://ollama.ai) or use Windows Subsystem for Linux (WSL).

### 2. Pull a Model

After installing Ollama, pull a model (recommended: Llama 3.1):

```bash
# Recommended for production (4.7GB)
ollama pull llama3.1

# Alternative options:
ollama pull mistral      # 4.1GB - Fast and efficient
ollama pull qwen2.5      # 4.4GB - Good for reasoning
ollama pull llama3.2     # 2.0GB - Smaller, faster
```

### 3. Verify Ollama is Running

```bash
ollama list
# Should show your downloaded models

curl http://localhost:11434/api/tags
# Should return JSON with available models
```

## Installation

1. **Install dependencies:**
   ```bash
   cd ai-middleware
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the middleware:**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.1` | Model to use for inference |
| `BACKEND_API_URL` | - | Your backend API base URL |

### Available Models

| Model | Size | Best For |
|-------|------|----------|
| `llama3.1` | 4.7GB | General purpose, high accuracy |
| `mistral` | 4.1GB | Fast inference, good reasoning |
| `qwen2.5` | 4.4GB | Complex reasoning tasks |
| `llama3.2` | 2.0GB | Resource-constrained environments |

## API Endpoints

### POST `/api/chat`

**Request:**
```json
{
  "message": "Cancel shipment for truck 123"
}
```

**Response:**
```json
{
  "reply": "Shipment for truck 123 has been successfully cancelled."
}
```

## Supported Intents

The AI can recognize these intents and extract parameters:

| Intent | Required Parameters | Example |
|--------|-------------------|---------|
| `cancel_shipment` | `truck_id` or `shipment_id` | "Cancel truck 123" |
| `assign_driver` | `truck_id`, `driver_name` | "Assign John to truck 456" |
| `track_order` | `truck_id` or `shipment_id` | "Track shipment 789" |
| `get_truck_status` | `truck_id` | "What's the status of truck 101?" |
| `update_location` | `truck_id`, `location` | "Update truck 202 location to Denver" |

## JSON Response Format

The AI middleware maintains this consistent JSON structure:

```json
{
  "intent": "cancel_shipment",
  "parameters": {
    "truck_id": "123"
  }
}
```

## Troubleshooting

### Ollama Not Responding
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama
ollama serve

# Check logs
tail -f ~/.ollama/logs/server.log
```

### Model Not Found
```bash
# List available models
ollama list

# Pull missing model
ollama pull llama3.1
```

### Memory Issues
If you're running out of memory:
1. Use a smaller model like `llama3.2`
2. Close other applications
3. Consider increasing system swap space

### Performance Optimization
- **GPU Acceleration:** Ollama automatically uses GPU if available (NVIDIA CUDA)
- **Model Selection:** Smaller models = faster inference
- **Temperature Setting:** Lower temperature (0.1) for consistent JSON output

## Development

### Adding New Intents

1. **Update the prompt in `services/aiService.js`:**
   ```javascript
   // Add to available intents list
   - new_intent (requires: parameter1, parameter2)
   ```

2. **Handle the intent in `services/intentHandler.js`:**
   ```javascript
   case 'new_intent':
     // Your logic here
     return result;
   ```

### Testing

```bash
# Test with curl
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Cancel truck 123"}'
```

## Performance Comparison

| Aspect | OpenAI GPT-4 | Local Llama 3.1 |
|--------|--------------|------------------|
| **Cost** | ~$0.01-0.03/request | Free |
| **Latency** | 1-3 seconds | 0.5-2 seconds |
| **Privacy** | Data sent to OpenAI | Local processing |
| **Availability** | Internet required | Works offline |
| **Accuracy** | Very high | High |

## License

MIT License - see LICENSE file for details. 