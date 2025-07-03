/**
 * AI agent configuration and LangChain integration types
 *
 * 🧠 Updated Memory Usage:
 *
 * // Proper way to use agent with memory:
 * const agent = await setupAgent(tools, { thread_id: "session-123" });
 *
 * const result = await agent.invoke(
 *   { messages: [new HumanMessage("Task description")] },
 *   { configurable: { thread_id: "session-123" } }
 * );
 *
 * The agent now remembers conversation history naturally through LangGraph's MemorySaver.
 */
export {};
//# sourceMappingURL=agent.js.map