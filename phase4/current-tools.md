# Current tools

## **Vercel AI SDK Version**
- **Version**: `6.0.37` (from package.json line 54)
- **Related packages**:
  - `@ai-sdk/react`: `3.0.39`
  - `@ai-sdk/gateway`: `3.0.15`
  - `@ai-sdk/provider`: `3.0.3`

## **Agent Configuration**
**Yes, there is only 1 agent** in this system. The chat API route (`app/(chat)/api/chat/route.ts`) shows a single agent configuration with:

- **Single model instance** per request (`getLanguageModel(selectedChatModel)`)
- **Unified tool set** available to the agent
- **No multi-agent architecture** - just one AI agent that handles all user interactions

## **Complete Tool List (13 tools)**

The agent has access to these tools:

### **Document Management Tools**
- [createDocument](cci:1://file:///c:/Users/netfl/TRIAL/nextjs-ai-chatbot/lib/ai/tools/create-document.ts:15:0-75:5) - Creates documents of various types (text, code, sheet, plan, presentation, webview)
- `updateDocument` - Updates existing document content
- `readDocument` - Reads document content
- `listDocuments` - Lists all available documents
- `searchDocuments` - Searches through documents

### **Plan Management Tools**
- `createPlan` - Creates structured project plans
- `updatePlan` - Updates existing plans
- `readPlan` - Reads plan content

### **Web & Information Tools**
- `browseWeb` - Extracts content from web pages using Browserbase
- `webSearch` - Performs web searches
- `getWeather` - Gets weather information

### **Code Execution Tool**
- `executeCode` - Executes code in a sandboxed environment

### **UI Tool**
- `requestSuggestions` - Provides chat suggestions to users

## **Tool Availability Notes**
- **Reasoning models** (like those with "reasoning" or "thinking" in name) have **tools disabled** - only the core chat functionality
- **Regular models** get access to all 13 tools
- Tools are defined in individual files under [lib/ai/tools/](cci:9://file:///c:/Users/netfl/TRIAL/nextjs-ai-chatbot/lib/ai/tools:0:0-0:0)
- Each tool is properly typed with Zod schemas and integrated with the AI SDK's tool system