Our final step here, now that we've implemented updating, deleting and adding memories, is to improve the way that we load memories.

Our current implementation loads the entire memory database into the LLM. This is practical in the short-term, but will eventually hit a wall as our memory system grows.

Instead, we should be able to quickly retrieve the most relevant memories for the current situation.

Guess what? We already know everything we need to implement this. In this workshop, we've built a complex retrieval mechanism using BM25 and using Semantic Search.

So I figure I'd show you the combination of the two systems as an explainer.

## The Query Rewriter

Inside our [`POST` route](./api/chat.ts) now, we begin with a query rewriter:

```ts
const queryRewriterResult = await generateObject({
  model: google('gemini-2.0-flash-001'),
  system: `You are a helpful memory search assistant, able to generate effective search queries for finding relevant memories in a user's memory system.
    Your job is to generate a list of keywords and a search query which will be used to search through the user's stored memories.
    The memories contain personal information, preferences, facts, and details about the user that have been shared in previous conversations.
  `,
  schema: z.object({
    keywords: z
      .array(z.string())
      .describe(
        "A list of keywords to search the user's memories with. Use these for exact terminology and specific terms mentioned in the conversation.",
      ),
    searchQuery: z
      .string()
      .describe(
        "A search query which will be used to search the user's memories. Use this for broader semantic search terms that capture the intent and context of the conversation.",
      ),
  }),
  prompt: `
    Conversation history:
    ${formatMessageHistory(messages)}
  `,
});
```

This generates a list of keywords and a search query. The keywords and search query get passed into a [`searchMemories` function](./search.ts), which loads all memories and uses both embeddings and BM25 search:

```ts
const allMemories = await searchMemories({
  searchQuery: queryRewriterResult.object.searchQuery,
  keywordsForBM25: queryRewriterResult.object.keywords,
});
```

We then merge the results together with Reciprocal Rank Fusion, slice off the top 10 memories, and format them using our [`formatMemory` utility](./utils.ts):

```ts
const formattedMemories = allMemories
  .slice(0, 10)
  .map((memory) => formatMemory(memory.memory))
  .join('\n\n');
```

These formatted memories are then passed into our system prompt:

```ts
const result = streamText({
  model: google('gemini-2.0-flash-lite'),
  system: `You are a helpful assistant that can answer questions and help with tasks.

  The date is ${new Date().toISOString().split('T')[0]}.

  You have access to the following memories:

  <memories>
  ${formattedMemories}
  </memories>
  `,
  messages: convertToModelMessages(messages),
});
```

When we're saving memories, we're also creating an embedding, using the [`embedMemory` function](./embeddings.ts):

```ts
saveMemories(
  await Promise.all(
    additions.map(async (addition) => ({
      id: generateId(),
      memory: addition,
      createdAt: new Date().toISOString(),
      embedding: await embedMemory(addition),
    })),
  ),
);
```

The [`saveMemories` function](./memory-persistence.ts) handles storing these memories with their embeddings.

Since memories are pretty small, you could probably fetch up to 30, 40, 50 without impacting context too much.

Try running the exercise locally, getting into conversation with the LLM, seeing what memories get pulled out and using console logs to check on the memories that are being loaded.

## Steps To Complete

- [ ] Review the query rewriter implementation that generates keywords and search queries.
  - [ ] Understand how the `searchMemories` function works with both embeddings and BM25.
  - [ ] Observe how Reciprocal Rank Fusion merges search results.
  - [ ] Examine how top memories are formatted and passed to the LLM.

- [ ] Test the system by running conversations and checking console logs.

- [ ] Review how embeddings are created and stored with memories
