# Development Setup Guide

This guide walks you through setting up and running the complete AI-powered chat system with both the React frontend and Node.js middleware.

## 🏗️ Project Structure

```
ai-chat-app/
├── ai-middleware/          # Node.js Express API with local LLM
├── cargo-chat-quest/       # React frontend with chat interface
└── DEV_SETUP.md           # This guide
```

## ⚡ Quick Start

### 1. Set Up Environment Variables

**For AI Middleware (`ai-middleware/.env`):**
```bash
cd ai-middleware
cp env-template.txt .env
```

Edit `.env`:
```
PORT=3001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1
BACKEND_API_URL=https://your-api.com/api
NODE_ENV=development
```

**For React Frontend (`cargo-chat-quest/.env`):**
```bash
cd cargo-chat-quest
echo "VITE_MIDDLEWARE_API_URL=http://localhost:3001" > .env
```

### 2. Install Dependencies

**Middleware:**
```bash
cd ai-middleware
npm install
```

**Frontend:**
```bash
cd cargo-chat-quest
npm install
```

### 3. Set Up Local LLM (Optional but Recommended)

For full AI functionality, install Ollama:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (choose one)
ollama pull llama3.1    # Recommended - 4.7GB
ollama pull mistral     # Fast alternative - 4.1GB
ollama pull llama3.2    # Smaller - 2.0GB

# Verify Ollama is running
ollama list
```

### 4. Start the Services

**Option A: Manual (Recommended for Development)**

Terminal 1 - Start Middleware:
```bash
cd ai-middleware
npm start
```

Terminal 2 - Start Frontend:
```bash
cd cargo-chat-quest
npm run dev
```

**Option B: Using the Test Script**

```bash
# From the project root
npm run dev-all  # (if you create this script)
```

## 🧪 Testing the Connection

### 1. Test Middleware Health
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "ai-middleware",
  "version": "1.0.0"
}
```

### 2. Test Chat Endpoint
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Cancel truck 123"}'
```

### 3. Test Frontend Connection

1. Open http://localhost:5173 (or the port shown in your terminal)
2. Click the chat button (bottom right)
3. Check the connection status indicator:
   - 🟢 Green = Connected to middleware + LLM working
   - 🟠 Orange = Middleware offline (fallback mode)
   - 🔴 Red = Connection failed

## 🎯 Chat Interface Features

### Available Commands

Try these sample messages in the chat:

| Message | Expected Intent | Parameters |
|---------|----------------|------------|
| "Cancel truck 123" | `cancel_shipment` | `truck_id: "123"` |
| "Assign John to truck 456" | `assign_driver` | `truck_id: "456", driver_name: "John"` |
| "Track shipment 789" | `track_order` | `shipment_id: "789"` |
| "What's the status of truck 101?" | `get_truck_status` | `truck_id: "101"` |

### Chat Interface Indicators

- **Connection Status**: Shows green/orange/gray dot next to "FleetPro AI Assistant"
- **Loading State**: Animated dots while AI processes your message
- **Error Handling**: Shows helpful error messages if connection fails
- **Offline Mode**: Continues working even if middleware is unavailable

## 🔧 Development Workflow

### Typical Development Session

1. **Start Ollama** (if using local LLM):
   ```bash
   ollama serve  # Usually starts automatically
   ```

2. **Start Middleware**:
   ```bash
   cd ai-middleware
   npm start
   ```
   Look for:
   ```
   🚀 AI middleware running on port 3001
   🏥 Health check: http://localhost:3001/api/health
   💬 Chat endpoint: http://localhost:3001/api/chat
   🌐 CORS enabled for frontend development servers
   ```

3. **Start Frontend**:
   ```bash
   cd cargo-chat-quest
   npm run dev
   ```
   Look for:
   ```
   Local:   http://localhost:5173/
   Network: use --host to expose
   ```

4. **Test the Connection**:
   - Open browser to http://localhost:5173
   - Click chat button
   - Send a test message
   - Check browser console for connection logs

### Making Changes

**Frontend Changes:**
- Edit files in `cargo-chat-quest/src/`
- Vite will hot-reload automatically
- Check browser console for errors

**Middleware Changes:**
- Edit files in `ai-middleware/`
- Restart the server: `Ctrl+C` then `npm start`
- Check terminal console for logs

### Debugging Connection Issues

**Frontend can't reach middleware:**
- ✅ Check middleware is running on port 3001
- ✅ Check CORS configuration in `ai-middleware/app.js`
- ✅ Check environment variable `VITE_MIDDLEWARE_API_URL`

**Middleware can't reach Ollama:**
- ✅ Check Ollama is running: `ollama list`
- ✅ Check model is available: `ollama pull llama3.1`
- ✅ Check environment variable `OLLAMA_HOST`

**Chat not responding:**
- ✅ Check browser console for errors
- ✅ Check middleware terminal for error logs
- ✅ Test endpoints manually with curl

## 📝 Console Logging

### Frontend Logs (Browser Console)
```
✅ Middleware connection established
🚀 Sending message to middleware: Cancel truck 123
✅ Received response from middleware: Shipment for truck 123 has been successfully cancelled.
```

### Middleware Logs (Terminal)
```
🏥 Health check requested
💬 Processing message: Cancel truck 123
✅ Sending reply: Shipment for truck 123 has been successfully cancelled.
```

## 🚀 Production Considerations

When deploying to production:

1. **Environment Variables**: Update API URLs and remove development flags
2. **CORS**: Restrict to your actual domain
3. **Error Handling**: Remove detailed error messages
4. **Logging**: Use proper logging service instead of console.log
5. **LLM**: Consider GPU servers for faster inference

## 📞 Need Help?

**Common Issues:**

- **Port 3001 already in use**: Change `PORT` in `.env` file
- **Ollama not found**: Install Ollama and pull a model
- **CORS errors**: Check allowed origins in `ai-middleware/app.js`
- **TypeScript errors**: Run `npm run build` to check for issues

**Debug Commands:**
```bash
# Check if ports are in use
lsof -i :3001
lsof -i :5173

# Check Ollama status
ollama list
ollama ps

# Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:5173  # Should return HTML
```

---

Happy coding! 🎉 