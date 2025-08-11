Our memory setup is working nicely, but it has a big problem - we can only _add_ memories. We can't update or delete them. This means it's only good for truly permanent information, which isn't realistic.

That ends up being quite limiting. Even "permanent" facts about people can change over time. You think you like window seats on planes, but as you get older (and perhaps your bladder gets worse), you might prefer aisle seats.

So our system needs to be able to not only add memories about you but also update its database of information.

This capability also gives us access to more interesting patterns where the AI can retain working memory about you, such as what you're currently focusing on. We don't have to restrict ourselves to permanent facts - we can include temporary information too, making the memory system more useful.

## The Schemas & System Prompt

We'll implement this inside our [`/api/chat.ts`](./api/chat.ts) file. Our first set of to-dos are in the `generateObject` call inside the `onFinish` function of `createUIMessageStream`. Here's what it currently looks like:

```ts
const memoriesResult = await generateObject({
  model: google('gemini-2.0-flash'),
  schema: z.object({
    // TODO: Define the schema for the updates. Updates should
    // be an array of objects with the following fields:
    // - id: The ID of the existing memory to update
    // - memory: The updated memory content
    updates: TODO,
    // TODO: Define the schema for the deletions. Deletions should
    // be an array of strings, each representing the ID of a memory
    // to delete
    deletions: TODO,
    // TODO: Define the schema for the additions. Additions should
    // be an array of strings, each representing a new memory to add
    additions: TODO,
  }),
  // TODO: Update the system prompt to tell it to return updates,
  // deletions and additions
  system: TODO,
});
```

Instead of simply returning a list of memories to add, we now want to return:

- A list of updates - existing memories that need to be modified
- A list of deletions - memories that should be removed
- A list of additions - new memories to add

## Updating The Database

Looking at the code, we've already extracted the updates, deletions, and additions from the `memoriesResult` object:

```ts
const { updates, deletions, additions } = memoriesResult.object;

console.log('Updates', updates);
console.log('Deletions', deletions);
console.log('Additions', additions);

// Only delete memories that are not being updated
const filteredDeletions = deletions.filter(
  (deletion) =>
    !updates.some((update) => update.id === deletion),
);

// TODO: Update the memories that need to be updated
// by calling updateMemory for each update
TODO;

// TODO: Delete the memories that need to be deleted
// by calling deleteMemory for each filtered deletion
TODO;

// TODO: Save the new memories by calling saveMemories
// with the new memories
TODO;
```

We need to implement the functionality to update memories using the `updateMemory` function, delete memories with `deleteMemory`, and save new memories with `saveMemories`. These functions already exist in the memory persistence file:

```ts
/**
 * Save all chats to the JSON file
 */
export function saveMemories(memories: DB.MemoryItem[]): void {
  const data = loadDB();
  data.memories = [...data.memories, ...memories];

  writeFileSync(
    DATA_FILE_PATH,
    JSON.stringify(data, null, 2),
    'utf-8',
  );
}

export function updateMemory(
  memoryId: string,
  memory: Omit<DB.MemoryItem, 'id'>,
): boolean {
  const data = loadDB();
  data.memories = data.memories.map((m) =>
    m.id === memoryId ? { ...m, ...memory } : m,
  );

  writeFileSync(
    DATA_FILE_PATH,
    JSON.stringify(data, null, 2),
    'utf-8',
  );

  return true;
}

export function deleteMemory(memoryId: string): boolean {
  const data = loadDB();
  data.memories = data.memories.filter((m) => m.id !== memoryId);

  writeFileSync(
    DATA_FILE_PATH,
    JSON.stringify(data, null, 2),
    'utf-8',
  );

  return true;
}
```

The logging functionality will let us see the AI updating previous memories, deleting them, and saving new ones as we interact with it. It's particularly interesting to contradict yourself and see how the LLM updates its understanding by modifying existing memories.

Good luck, and I'll see you in the solution.

## Steps To Complete

- [ ] Define the schema for updates, deletions, and additions in the `generateObject` call
  - [ ] Replace the TODOs with proper Zod schema definitions, including descriptions of the fields

- [ ] Update the system prompt to instruct the AI to manage memories
  - [ ] Modify the existing system prompt to include instructions for handling updates and deletions

- [ ] Implement the memory operations in the three TODO sections inside `onFinish`
  - [ ] Write code to call the appropriate memory functions for updates, deletions, and additions

- [ ] Test your implementation
  - [ ] Run the local dev server
  - [ ] Have a conversation with the AI and check console logs
  - [ ] Try creating a memory, then saying something contradictory, to see memory updates and deletions
