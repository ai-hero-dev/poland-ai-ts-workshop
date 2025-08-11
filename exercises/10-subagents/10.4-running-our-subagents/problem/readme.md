OK, we've got the basics done. Now let's go and execute the tasks.

The way it's going to work is:

1. The orchestrator decides which tasks to run
2. The orchestrator executes the tasks
3. The tasks report their output to a shared 'diary'
4. The orchestrator begins the loop again, reading the diary, until there are no more tasks to run

We'll use a diary data structure to track the work performed, which will be crucial for the orchestrator to make informed decisions about what to do next.

## The Diary

First, we need to create a diary data structure. The simplest approach is to use a string that we append to - that's what I've done in the solution.

```ts
// Inside the POST function in our api/chat.ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      // TODO: Create a diary data structure to keep track of the
      // work performed so far.
      // In the solution, I've used a simple string to track
      // the work performed so far, which is simple appended to.
      let diary = TODO;

      // ...other stuff
    },
  });
};
```

This string will store a record of all tasks executed and their results, which will be passed to the orchestrator so it can keep track of what's been done.

## The `while` loop

Our main loop is a simple while loop that runs until we've taken 10 steps (to prevent infinite loops). It's very similar to the loop we had in [previous exercises](/exercises/04-agents-and-workflows/04.3-creating-your-own-loop/problem/readme.md).

```ts
// NOTE: We'll be using this to track the number of steps
// we've taken.
let step = 0;

// NOTE: We'll run this loop until we've taken 10 steps.
// This prevents the loop from running forever.
while (step < 10) {
  // ...loop code here...
  step++;
}
```

## Executing the Subagents

After the orchestrator determines which tasks to run, we need to execute them in parallel using `Promise.all`. For each task, we:

1. Get the appropriate subagent from our map of subagents
2. Call the subagent with the task's prompt
3. Update the UI with the result
4. Update our diary with the new information

Here's the code structure:

```ts
// Inside the while loop in our api/chat.ts
await Promise.all(
  tasksWithIds.map(async (task) => {
    const subagent = subagents[task.subagent];

    if (!subagent) {
      throw new Error(`Unknown subagent: ${task.subagent}`);
    }

    try {
      // TODO: Call the subagent with the task.task as the prompt.
      // The result should be the output of the subagent.
      const result = TODO;

      // TODO: Write the updated task to the client,
      // using writer.write, remembering to pass in the id.
      writer.write(TODO);

      // TODO: Update the diary with the new result.
      diary = TODO;
    } catch (error) {
      // TODO: If the task fails, write the error to the client,
      // using writer.write, remembering to pass in the id.
      writer.write(TODO);

      // TODO: Update the diary with the new error.
      diary = TODO;
    }
  }),
);
```

To update the UI, we use the `writer.write` method. This updates the task item in our UI with the output from the subagent.

To update the diary, we simply append the new result with some context about which task was executed and what the result was.

If a task fails, we need to update the UI and the diary with the error.

## Passing the Diary to the Orchestrator

For the orchestrator to make informed decisions, we need to pass the diary into the prompt:

```ts
// Inside the while loop in our api/chat.ts
const tasksResult = streamObject({
  // TODO: Pass the diary into the prompt so that the
  // orchestrator can track the work performed so far
  // and plan the next step.
  prompt: `
    Initial prompt:

    ${formattedMessages}
  `,
  // Rest of the code...
```

This allows the orchestrator to see what has been done already and avoid repeating tasks.

## Preserving Task History Between Runs

Finally, we need to update the message history to include the task parts. This ensures that if we ask a follow-up question, the agent will know what's been done already:

````ts
// Inside formatMessageHistory in our api/chat.ts
const formatMessageHistory = (messages: MyMessage[]) => {
  return messages
    .map((message) => {
      return [
        message.role === 'user' ? '## User' : '## Assistant',
        message.parts
          .map((part) => {
            if (part.type === 'text') {
              return part.text;
            }

            // TODO: The task parts need to be formatted and
            // passed into the message history. Without this,
            // no task history will be preserved between runs.
            // This means that in a situation like this:
            //
            // ```
            // User: Find all of my lessons for tomorrow and pull up all of their notes.
            // Task Data: I found one lesson with id "123" at 9AM.
            // Assistant: You have a lesson at 9AM tomorrow.
            // ```
            //
            // The information about the "id" will be lost, and
            // will need to be re-fetched from the subagent.
            TODO;

            return '';
          })
          .join('\n'),
      ].join('\n');
    })
    .join('\n');
};
````

This converts the task data into a string format that can be included in the message history - so that the orchestrator can see what's been done already in previous runs.

Good luck, and I'll see you in the solution!

## Steps To Complete

- [ ] Create a diary data structure (a simple string will work) to track work performed

- [ ] Implement the task execution by calling the subagent with the task's prompt

- [ ] Update the UI with the task result using `writer.write`

- [ ] Update the diary with the task result

- [ ] In the `catch` block, update the diary and UI with the error

- [ ] Pass the diary into the orchestrator's prompt so it can track work performed

- [ ] Update the message history to include task parts so they're preserved between conversations

- [ ] Test your implementation by making a request in the UI and watching tasks being executed and checked off

- [ ] Verify that the orchestrator correctly uses the data parts in the me to plan subsequent steps
