import { getContextForChat, getMemories } from '../services/memoryService';

export async function enhancePromptWithMemory(userMessage, conversationHistory) {
  // Get recent conversation
  const recentMessages = conversationHistory
    .slice(-5)
    .map(msg => msg.content)
    .concat(userMessage);

  // Get relevant memories
  const relevantMemories = await getContextForChat(recentMessages);

  if (relevantMemories.length === 0) {
    return userMessage; // No relevant context
  }

  // Build context string
  const memoryContext = relevantMemories
    .map(m => `[${m.category}] ${m.content}`)
    .join('\n');

  // Enhance prompt
  const enhancedPrompt = `
<context_from_memory>
${memoryContext}
</context_from_memory>

<user_message>
${userMessage}
</user_message>

השתמש בהקשר מהזיכרון כדי לתת תשובה רלוונטית ומותאמת אישית.
`;

  return enhancedPrompt;
}

export async function getAllMemoriesForDisplay() {
  return await getMemories();
}