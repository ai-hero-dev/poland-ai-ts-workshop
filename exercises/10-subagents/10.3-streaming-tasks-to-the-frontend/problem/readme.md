Now we're generating a list of tasks, and we need to stream those to the frontend.

## The `streamObject` call

The first obvious step is to swap the `generateObject` call to a `streamObject` call inside the POST route. While the call signature can remain the same, we need to handle the output differently.

```ts
// TODO: Swap this over to streamObject instead of generateObject.
const tasksResult = await generateObject({
  // ...
});
```

## Streaming the tasks to the frontend

The main focus is on taking the tasks as they come down and streaming them into the UI. We need to monitor the `tasksResult.partialObjectStream`. Tasks will be streamed down index by index - first the zero-indexed one, then the first-indexed one, and so on. As a reminder for how this works, check out the [reference](/exercises/99-reference/99.1-stream-object-partial-object-stream/explainer/readme.md).

To update the UI properly, we need IDs to reference the parts in the UI. The provided code maps indexes to IDs. As tasks are generated, we iterate over each one, take the index, and if we haven't discovered that index already, we set it to a random UUID. This gives us a static ID we can rely on. As a reminder for how this works, check out the [reference](/exercises/99-reference/99.4-custom-data-parts-id-reconciliation/explainer/readme.md).

```ts
const indexToIdMap = new Map<number, string>();

for await (const chunk of tasksResult.partialObjectStream) {
  const tasks = chunk.tasks ?? [];

  tasks.forEach((task, index) => {
    if (!indexToIdMap.has(index)) {
      indexToIdMap.set(index, crypto.randomUUID());
    }

    // This is the id of the task.
    const id = indexToIdMap.get(index)!;

    // TODO: Write the task to the client
  });
}
```

## Defining the `data-task` type

But before we can write the task to the client, we need to define the `data-task` type in the `MyMessage` type. We need to go up to the `MyMessage` definition and define this type that will store the tasks our main agent delegates to the sub-agents:

```ts
type MyMessage = UIMessage<
  unknown,
  {
    // TODO: Define a 'data-task' type that will
    // be used to store the tasks our main agent
    // delegates to the subagents.
    // Tasks should have the following fields:
    // - id: the id of the task
    // - subagent: the name of the subagent that will perform the task
    // - task: the task to perform
    // - output: the output of the task
    task: TODO;
  }
>;
```

Once we've defined this shape, we can use `writer.write` to send the task to the front end.

## Rendering the tasks in the frontend

The final step is to go into the [`Message` component](./client/components.tsx) in the front end and render the `TaskItem`:

```tsx
{
  parts.map((part) => {
    if (part.type === 'text') {
      return (
        <div className="text-gray-100 prose prose-invert">
          <ReactMarkdown>{part.text}</ReactMarkdown>
        </div>
      );
    }

    // TODO: Render the task item by using the TaskItem component
    // below. Feel free to adjust it to your visual style!
    TODO;
  });
}
```

A `TaskItem` component is already provided - it renders like a checkbox that gets checked off when completed. Feel free to add your own visual flair if you'd like.

After completing these steps, instead of checking the terminal for tasks, you should see them in the front end. You can test your implementation by prompting the UI a few times to see different results.

Good luck, and I'll see you in the solution!

## Steps To Complete

- [ ] Define the `data-task` type in the `MyMessage` type in our [`api/chat.ts`](./api/chat.ts)

- [ ] Replace `generateObject` with `streamObject` in the POST route

- [ ] Implement the `writer.write` call to send the task to the frontend

- [ ] Add task rendering to the [`Message` component](./client/components.tsx)

- [ ] Test the implementation by prompting the UI and observing the tasks in the frontend
