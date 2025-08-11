There's something conceptually wrong with our setup, which is that we are losing some of the benefits of using subagents.

Good subagent systems isolate the context windows of the subagent from the orchestrator. Right now, our subagents are _not_ isolated.

When we call our subagents, they go off and do their work, talk extensively, return tool call outputs. Then all of that chatter gets put into the diary that the orchestrator agent reads.

This is really context inefficient. The diary ends up being extremely large, as does the output of those data parts that get streamed to the front end. What would be much better is if we could summarize that output, making it smaller, which would prevent us from paying double cost for those tokens.

In the process of summarizing them, the outputs will get smaller, be put into the message history, and only what needs to be shown to the user will be shown. This will result in a more pleasing output and a more isolated set of subagents.

That's a huge benefit of using subagents - you can delegate tasks to them which then don't significantly impact the context window of the parent. This means you can have longer conversations with the AI and complete more work per session.

So we're going to summarize the output of each subagent before we write it to the front end and before we write it to the diary.

## The `summarizeAgentOutput` Function

The way this will work is via a new function we're going to implement called `summarizeAgentOutput`. Here's what we need to complete in our [`api/summarize-agent-output.ts`](./api/summarize-agent-output.ts) file:

```ts
// problem/api/summarize-agent-output.ts
export const summarizeAgentOutput = async (opts: {
  onSummaryDelta: (delta: string) => void;
  initialPrompt: string;
  agentOutput: string;
}): Promise<string> => {
  // TODO: Call streamText to summarize the agent's output.
  // Use the getSummarizeSystemPrompt function to create the system prompt.
  // Use the initialPrompt and agentOutput to create the prompt.
  const summarizeStreamResult = TODO;

  // TODO: For each chunk of the textStream, call opts.onSummaryDelta
  // with the chunk.
  TODO;

  // TODO: Return the final summary from the stream.
  return TODO;
};
```

We'll use the `streamText` function and the `getSummarizeSystemPrompt` function which is already defined:

```ts
const getSummarizeSystemPrompt = () => {
  return `
    You are a helpful assistant that summarizes a subagent's output.
    You will be given an agent's thought process and results, and you will need to summarize the results.
    You will also be given the initial prompt so you can understand the context of the output.
    Provide a summary that is relevant to the initial prompt.
    Reply as if you are the subagent.
    The user will ONLY see the summary, not the thought process or results - so make it good!
  `;
};
```

## Updating the Subagent Execution Code

In our [`api/chat.ts`](./api/chat.ts) file, we need to update the code that executes the subagents to use our new summarizing function:

```ts
// problem/api/chat.ts
// Inside the POST function, where we execute the tasks:

await Promise.all(
  tasksWithIds.map(async (task) => {
    const subagent = subagents[task.subagent];

    if (!subagent) {
      throw new Error(`Unknown subagent: ${task.subagent}`);
    }

    try {
      const result = await subagent({
        prompt: task.task,
      });

      // TODO: Call summarizeAgentOutput to summarize the
      // agent's output.
      // Each time the summary is updated, update the data-task
      // part in the client with the new output.
      // Remember that the onSummaryDelta callback only
      // returns the latest text delta, so you'll need to
      // keep track of the full summary yourself so
      // you can pass it in to the writer.write call.
      const summary = TODO;

      diary = [
        diary,
        '',
        `The ${task.subagent} subagent was asked to perform the following task:`,
        `<task>`,
        task.task,
        `</task>`,
        `The subagent provided the following output:`,
        `<output>`,
        // TODO: The summary should be passed in here.
        TODO,
        `</output>`,
      ].join('\n');
    } catch (error) {
      // Error handling code...
    }
  }),
);
```

In this code, we need to:

1. Call `summarizeAgentOutput` with the appropriate parameters
2. Keep track of the full summary as it's generated
3. Update the client and the diary with the summary instead of the full result

It's worth knowing that keeping track of the full summary is necessary because `onSummaryDelta` only returns the latest text delta - and we need to pass the full summary to the `writer.write` call.

You can keep track of it by monitoring the `onSummaryDelta` and concatenating it to a string variable - nothing fancy.

## Steps To Complete

- [ ] Implement the `summarizeAgentOutput` function in [`api/summarize-agent-output.ts`](./api/summarize-agent-output.ts)
  - [ ] Use `streamText`
  - [ ] Set up the system prompt using `getSummarizeSystemPrompt()`
  - [ ] Process each chunk from the text stream and call the `onSummaryDelta` callback
  - [ ] Return the complete summary when done

- [ ] Update the subagent execution code in [`api/chat.ts`](./api/chat.ts)
  - [ ] Create a variable to track the full summary
  - [ ] Call `summarizeAgentOutput` with appropriate parameters including an `onSummaryDelta` callback
  - [ ] Update the `data-task` in the client with the current summary state
  - [ ] Replace the placeholder in the diary with the summary

- [ ] Test your implementation by running the exercise
  - [ ] Check that the outputs in the UI are more concise
  - [ ] Make sure the UI updates progressively as the summary is generated
