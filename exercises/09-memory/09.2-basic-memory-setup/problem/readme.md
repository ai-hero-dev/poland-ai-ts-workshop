While using Mem0 is a great way to get started with memory, it's often better to own the logic for your memory system yourself.

In this exercise, we're going to begin that journey.

## Loading The Memories

All our work will be done inside our [`POST` route](./api/chat.ts). I've given you a [`memory-persistence.ts`](./api/memory-persistence.ts) file that has a couple of key functions, including `loadMemories()` and `saveMemories()`.

Your first job then is to load the memories out of the JSON file, format them into text, and then pass that text into the LLM that we're calling.

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  // TODO: Use the loadMemories function to load the memories from the database
  const memories = TODO;

  // TODO: Format the memories to display in the UI using the formatMemory function
  const memoriesText = TODO;

  const stream = createUIMessageStream<MyMessage>({
  // ...
```

This will mean that when we call the LLM, it will have access to our entire memory database. This might be quite large, but we'll add some retrieval mechanisms to this later.

## `onFinish`

The really important bit and the meat of this exercise happens in the `onFinish` callback of `createUIMessageStream()`:

```ts
onFinish: async (response) => {
  const allMessages = [...messages, ...response.messages];

  // TODO: Generate the memories using the generateObject function
  // Pass it the entire message history and the existing memories
  // Write a system prompt that tells the LLM to only focus on permanent memories
  // and not temporary or situational information
  const memoriesResult = TODO;

  const newMemories = memoriesResult.object.memories;

  // TODO: Save the new memories to the database using the saveMemories function
};
```

We're first going to get an entire message history by appending the messages or rather the response messages to our existing messages:

```ts
const allMessages = [...messages, ...response.messages];
```

We've then got a pretty meaty `TODO` down here. Using the `generateObject` function, we want to pass it the entire message history and the existing memories. We're going to get it to extract out some memories just as little texts in an array of strings.

```ts
// TODO: Generate the memories using the generateObject function
// Pass it the entire message history and the existing memories
// Write a system prompt that tells the LLM to only focus on permanent memories
// and not temporary or situational information
const memoriesResult = TODO;
```

These memories should focus on permanent information about the user, rather than temporary or situational information.

Then, we're going to save those new memories to the database using the existing `saveMemories` function.

```ts
// TODO: Save the new memories to the database using the saveMemories function
```

Good luck. And I will see you in the solution.

## Steps To Complete

- [ ] Complete the first TODO by using `loadMemories()` to get existing memories

- [ ] Complete the second TODO to format memories using `formatMemory` and join them with newlines

- [ ] Implement the memory extraction TODO:
  - [ ] Use `generateObject` with the Google Gemini model
  - [ ] Create a schema that expects an array of strings using `zod`
  - [ ] Write a system prompt explaining what permanent memories are (vs temporary information)
  - [ ] Pass the conversation history and existing memories in the prompt

- [ ] Implement the final TODO to save the new memories:
  - [ ] Transform the memory strings into objects with ID and timestamp
  - [ ] Use the `saveMemories` function to store them

- [ ] Add console logging to track what memories are being added

- [ ] Test your implementation by:
  - [ ] Having a conversation with the assistant
  - [ ] Watching the `memories.local.json` file for new entries
  - [ ] Refreshing the page to see if the assistant remembers information from previous conversations
